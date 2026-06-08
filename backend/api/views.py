"""
API Views for Athlete Performance and Injury Tracking System.
Handles authentication, CRUD, dashboard stats, and report generation.
"""
from datetime import date, timedelta
from django.contrib.auth import authenticate, login, logout
from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking
)
from .serializers import (
    AthleteSerializer, AthleteListSerializer, PerformanceSerializer,
    InjurySerializer, CompetitionSerializer, CompetitionResultSerializer,
    AttendanceSerializer, WeightTrackingSerializer, LoginSerializer, UserSerializer
)
from .reports import (
    generate_athletes_pdf, generate_performance_pdf, generate_injuries_pdf,
    generate_athletes_excel, generate_performance_excel, generate_attendance_excel
)


# ==================== Authentication ====================

class LoginView(APIView):
    """Admin login with session management."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """Admin logout - destroys session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})


class CurrentUserView(APIView):
    """Get current authenticated user info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ==================== Athlete Management ====================

class AthleteViewSet(viewsets.ModelViewSet):
    """
    Athlete CRUD: Add, Edit, Delete, Search, View Profile.
    Search via ?search=query parameter.
    """
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return AthleteListSerializer
        return AthleteSerializer

    def get_queryset(self):
        queryset = Athlete.objects.all()
        search = self.request.query_params.get('search', None)
        sport = self.request.query_params.get('sport', None)
        status_filter = self.request.query_params.get('status', None)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(sport__icontains=search) |
                Q(team__icontains=search)
            )
        if sport:
            queryset = queryset.filter(sport__iexact=sport)
        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)
        return queryset

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Full athlete profile with related data summary."""
        athlete = self.get_object()
        data = AthleteSerializer(athlete).data
        data['performance_count'] = athlete.performances.count()
        data['injury_count'] = athlete.injuries.count()
        data['competition_count'] = athlete.competition_results.count()
        data['attendance_count'] = athlete.attendance_records.count()
        data['latest_performance'] = PerformanceSerializer(
            athlete.performances.first()
        ).data if athlete.performances.exists() else None
        data['active_injuries'] = InjurySerializer(
            athlete.injuries.exclude(recovery_status='Recovered'), many=True
        ).data
        data['latest_weight'] = WeightTrackingSerializer(
            athlete.weight_records.first()
        ).data if athlete.weight_records.exists() else None
        return Response(data)


# ==================== Performance Tracking ====================

class PerformanceViewSet(viewsets.ModelViewSet):
    """Record and view speed, strength, endurance, flexibility, agility."""
    queryset = Performance.objects.select_related('athlete').all()
    serializer_class = PerformanceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Performance dashboard data for charts."""
        athlete_id = request.query_params.get('athlete_id')
        queryset = self.get_queryset()
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)

        records = queryset.order_by('record_date')[:12]
        return Response({
            'labels': [r.record_date.strftime('%b %Y') for r in records],
            'speed': [float(r.speed_score or 0) for r in records],
            'strength': [float(r.strength_score or 0) for r in records],
            'endurance': [float(r.endurance_score or 0) for r in records],
            'flexibility': [float(r.flexibility_score or 0) for r in records],
            'agility': [float(r.agility_score or 0) for r in records],
        })


# ==================== Injury Tracking ====================

class InjuryViewSet(viewsets.ModelViewSet):
    """Add injury, update recovery status, view history."""
    queryset = Injury.objects.select_related('athlete').all()
    serializer_class = InjurySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        athlete_id = self.request.query_params.get('athlete_id')
        recovery_status = self.request.query_params.get('recovery_status')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        if recovery_status:
            queryset = queryset.filter(recovery_status=recovery_status)
        return queryset

    @action(detail=True, methods=['patch'])
    def update_recovery(self, request, pk=None):
        """Update recovery status of an injury."""
        injury = self.get_object()
        recovery_status = request.data.get('recovery_status')
        if recovery_status:
            injury.recovery_status = recovery_status
            if recovery_status == 'Recovered':
                injury.actual_recovery_date = date.today()
            injury.save()
            return Response(InjurySerializer(injury).data)
        return Response({'error': 'recovery_status required'}, status=status.HTTP_400_BAD_REQUEST)


# ==================== Competition Management ====================

class CompetitionViewSet(viewsets.ModelViewSet):
    """Add competitions and manage results/medals."""
    queryset = Competition.objects.prefetch_related('results').all()
    serializer_class = CompetitionSerializer

    @action(detail=True, methods=['post'])
    def add_result(self, request, pk=None):
        """Store competition result for an athlete."""
        competition = self.get_object()
        data = request.data.copy()
        data['competition'] = competition.id
        serializer = CompetitionResultSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def medals(self, request):
        """Medal tracking summary."""
        results = CompetitionResult.objects.all()
        return Response({
            'gold': results.filter(medal='Gold').count(),
            'silver': results.filter(medal='Silver').count(),
            'bronze': results.filter(medal='Bronze').count(),
            'total': results.exclude(medal='None').count(),
        })


class CompetitionResultViewSet(viewsets.ModelViewSet):
    """CRUD for individual competition results."""
    queryset = CompetitionResult.objects.select_related('athlete', 'competition').all()
    serializer_class = CompetitionResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        competition_id = self.request.query_params.get('competition_id')
        athlete_id = self.request.query_params.get('athlete_id')
        if competition_id:
            queryset = queryset.filter(competition_id=competition_id)
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        return queryset


# ==================== Attendance Tracking ====================

class AttendanceViewSet(viewsets.ModelViewSet):
    """Mark attendance and view reports."""
    queryset = Attendance.objects.select_related('athlete').all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        athlete_id = self.request.query_params.get('athlete_id')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        if date_from:
            queryset = queryset.filter(attendance_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(attendance_date__lte=date_to)
        return queryset

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Mark attendance for multiple athletes at once."""
        records = request.data.get('records', [])
        created = []
        for record in records:
            serializer = AttendanceSerializer(data=record)
            if serializer.is_valid():
                serializer.save(marked_by=request.user)
                created.append(serializer.data)
        return Response({'created': len(created), 'records': created})

    @action(detail=False, methods=['get'])
    def report(self, request):
        """Attendance report with statistics."""
        queryset = self.get_queryset()
        total = queryset.count()
        present = queryset.filter(status='Present').count()
        absent = queryset.filter(status='Absent').count()
        late = queryset.filter(status='Late').count()
        return Response({
            'total_records': total,
            'present': present,
            'absent': absent,
            'late': late,
            'attendance_rate': round((present / total * 100) if total > 0 else 0, 1),
            'records': AttendanceSerializer(queryset[:50], many=True).data,
        })


# ==================== Weight Monitoring ====================

class WeightTrackingViewSet(viewsets.ModelViewSet):
    """Weight tracking with auto BMI calculation."""
    queryset = WeightTracking.objects.select_related('athlete').all()
    serializer_class = WeightTrackingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        return queryset

    @action(detail=False, methods=['post'])
    def calculate_bmi(self, request):
        """BMI calculator endpoint."""
        weight = float(request.data.get('weight_kg', 0))
        height = float(request.data.get('height_cm', 0))
        if weight <= 0 or height <= 0:
            return Response({'error': 'Valid weight and height required'}, status=400)
        height_m = height / 100
        bmi = round(weight / (height_m ** 2), 2)
        if bmi < 18.5:
            category = 'Underweight'
        elif bmi < 25:
            category = 'Normal'
        elif bmi < 30:
            category = 'Overweight'
        else:
            category = 'Obese'
        return Response({'bmi': bmi, 'category': category})


# ==================== Dashboard ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Dashboard statistics with chart data."""
    athletes = Athlete.objects.all()
    injuries = Injury.objects.exclude(recovery_status='Recovered')
    performances = Performance.objects.all()
    competitions = Competition.objects.all()
    results = CompetitionResult.objects.all()
    attendance = Attendance.objects.all()

    avg_perf = performances.aggregate(
        speed=Avg('speed_score'),
        strength=Avg('strength_score'),
        endurance=Avg('endurance_score'),
        flexibility=Avg('flexibility_score'),
        agility=Avg('agility_score'),
    )

    sport_dist = list(
        athletes.values('sport').annotate(count=Count('id')).order_by('-count')
    )

    injury_severity = list(
        injuries.values('severity').annotate(count=Count('id'))
    )

    # Monthly attendance for last 6 months
    monthly_attendance = []
    for i in range(5, -1, -1):
        month_start = date.today().replace(day=1) - timedelta(days=i * 30)
        month_end = month_start + timedelta(days=30)
        month_records = attendance.filter(
            attendance_date__gte=month_start,
            attendance_date__lt=month_end
        )
        total = month_records.count()
        present = month_records.filter(status='Present').count()
        monthly_attendance.append({
            'month': month_start.strftime('%b %Y'),
            'present': present,
            'absent': month_records.filter(status='Absent').count(),
            'rate': round((present / total * 100) if total > 0 else 0, 1),
        })

    # Performance trend (last 6 records)
    recent_perf = performances.order_by('-record_date')[:6]
    performance_trend = [
        {
            'date': p.record_date.strftime('%d-%m-%Y'),
            'athlete': p.athlete.full_name,
            'avg_score': round(sum(filter(None, [
                float(p.speed_score or 0), float(p.strength_score or 0),
                float(p.endurance_score or 0), float(p.flexibility_score or 0),
                float(p.agility_score or 0)
            ])) / 5, 1)
        }
        for p in reversed(list(recent_perf))
    ]

    return Response({
        'total_athletes': athletes.count(),
        'active_athletes': athletes.filter(status='Active').count(),
        'injured_athletes': athletes.filter(status='Injured').count(),
        'active_injuries': injuries.count(),
        'total_competitions': competitions.count(),
        'gold_medals': results.filter(medal='Gold').count(),
        'silver_medals': results.filter(medal='Silver').count(),
        'bronze_medals': results.filter(medal='Bronze').count(),
        'avg_performance': {k: round(float(v or 0), 1) for k, v in avg_perf.items()},
        'sport_distribution': sport_dist,
        'injury_by_severity': injury_severity,
        'monthly_attendance': monthly_attendance,
        'performance_trend': performance_trend,
    })


# ==================== Reports ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_pdf(request):
    """Generate PDF reports. ?type=athletes|performance|injuries"""
    report_type = request.query_params.get('type', 'athletes')

    if report_type == 'athletes':
        buffer = generate_athletes_pdf(Athlete.objects.all())
        filename = 'athletes_report.pdf'
    elif report_type == 'performance':
        buffer = generate_performance_pdf(Performance.objects.select_related('athlete').all())
        filename = 'performance_report.pdf'
    elif report_type == 'injuries':
        buffer = generate_injuries_pdf(Injury.objects.select_related('athlete').all())
        filename = 'injuries_report.pdf'
    else:
        return Response({'error': 'Invalid report type'}, status=400)

    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_excel(request):
    """Export data to Excel. ?type=athletes|performance|attendance"""
    report_type = request.query_params.get('type', 'athletes')

    if report_type == 'athletes':
        buffer = generate_athletes_excel(Athlete.objects.all())
        filename = 'athletes_export.xlsx'
    elif report_type == 'performance':
        buffer = generate_performance_excel(Performance.objects.select_related('athlete').all())
        filename = 'performance_export.xlsx'
    elif report_type == 'attendance':
        buffer = generate_attendance_excel(Attendance.objects.select_related('athlete').all())
        filename = 'attendance_export.xlsx'
    else:
        return Response({'error': 'Invalid export type'}, status=400)

    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response