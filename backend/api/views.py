"""
API Views for AthleteForge — Athlete Performance and Injury Tracking System.
Authentication, role-based access, CRUD, dashboard, AI insights, reports.
"""
from datetime import date, timedelta

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_insights import get_ai_insights_for_athlete, get_demo_ai_insights, answer_copilot_question
from .models import (
    Athlete, Performance, Injury, Competition,
    CompetitionResult, Attendance, WeightTracking, PasswordResetToken, UserProfile
)
from .permissions import (
    is_staff_role, is_admin_role, get_athlete_for_user, filter_queryset_by_role,
    filter_athletes_by_role, IsCoachOrAdmin, ReadOnlyForStudents, IsAdminOnly,
)
from .serializers import (
    AthleteSerializer, AthleteListSerializer, PerformanceSerializer,
    InjurySerializer, CompetitionSerializer, CompetitionResultSerializer,
    AttendanceSerializer, WeightTrackingSerializer, LoginSerializer,
    UserSerializer, RegisterSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, AdminUserSerializer, AdminUserUpdateSerializer,
    AdminCreateUserSerializer,
)
from .reports import (
    generate_athletes_pdf, generate_performance_pdf, generate_injuries_pdf,
    generate_athletes_excel, generate_performance_excel, generate_attendance_excel
)


def _resolve_user_from_login(data):
    """Authenticate by email or username (with local-part fallback)."""
    email = data.get('email', '').strip()
    username = data.get('username', '').strip()
    password = data['password']

    if email:
        try:
            user_obj = User.objects.get(email__iexact=email)
            user = authenticate(username=user_obj.username, password=password)
            if user:
                return user
        except User.DoesNotExist:
            pass
        # e.g. admin@athleteforge.com when stored email differs — try local part
        local = email.split('@')[0].strip()
        if local and local != username:
            user = authenticate(username=local, password=password)
            if user:
                return user

    if username:
        user = authenticate(username=username, password=password)
        if user:
            return user

    return None


# ==================== Authentication ====================

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfView(APIView):
    """Return CSRF token for cross-origin SPA (cookie on API domain + JSON body)."""
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({'csrfToken': token})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    """Email or username login with session management."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = _resolve_user_from_login(serializer.validated_data)
        if user is not None:
            if not user.is_active:
                return Response(
                    {'error': 'This account has been deactivated. Contact your administrator.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            login(request, user)
            request.session.save()
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user, context={'request': request}).data,
                'csrfToken': get_token(request),
            })
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    """Student self-registration with optional athlete link by email."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response({
            'message': 'Registration successful',
            'user': UserSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class ForgotPasswordView(APIView):
    """Generate password reset token (demo: returned in DEBUG mode)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({
                'message': 'If an account exists with this email, a reset link has been sent.',
            })

        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        token_obj = PasswordResetToken.objects.create(user=user)

        payload = {'message': 'Password reset instructions sent.'}
        if settings.DEBUG:
            payload['reset_token'] = token_obj.token
            payload['note'] = 'Token shown only in DEBUG mode for demo/viva.'

        return Response(payload)


class ResetPasswordView(APIView):
    """Reset password using valid token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_obj = PasswordResetToken.objects.get(token=serializer.validated_data['token'])
        user = token_obj.user
        user.set_password(serializer.validated_data['password'])
        user.save()
        token_obj.used = True
        token_obj.save()

        return Response({'message': 'Password reset successful. You can now log in.'})


class LogoutView(APIView):
    """Logout — destroys session (works even if session is partially expired)."""
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
        request.session.flush()
        response = Response({'message': 'Logout successful'})
        response.delete_cookie(
            settings.SESSION_COOKIE_NAME,
            path=settings.SESSION_COOKIE_PATH,
            domain=settings.SESSION_COOKIE_DOMAIN,
            samesite=settings.SESSION_COOKIE_SAMESITE,
        )
        response.delete_cookie(
            settings.CSRF_COOKIE_NAME,
            path=settings.CSRF_COOKIE_PATH,
            domain=settings.CSRF_COOKIE_DOMAIN,
            samesite=settings.CSRF_COOKIE_SAMESITE,
        )
        return response


class CurrentUserView(APIView):
    """Get current authenticated user with role info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)


# ==================== Athlete Management ====================

class AthleteViewSet(viewsets.ModelViewSet):
    """Athlete CRUD — coaches manage all; students view own profile only."""
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    permission_classes = [IsAuthenticated, ReadOnlyForStudents]

    def get_serializer_class(self):
        if self.action == 'list':
            return AthleteListSerializer
        return AthleteSerializer

    def get_queryset(self):
        queryset = filter_athletes_by_role(Athlete.objects.all(), self.request.user)
        search = self.request.query_params.get('search')
        sport = self.request.query_params.get('sport')
        status_filter = self.request.query_params.get('status')

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

    def perform_create(self, serializer):
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Only coaches can add athletes.')
        serializer.save()

    def perform_update(self, serializer):
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Only coaches can edit athletes.')
        serializer.save()

    def perform_destroy(self, instance):
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Only coaches can delete athletes.')
        instance.delete()

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Full athlete profile with related data summary."""
        athlete = self.get_object()
        data = AthleteSerializer(athlete, context={'request': request}).data
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
    """Performance records — students: own data read-only."""
    queryset = Performance.objects.select_related('athlete').all()
    serializer_class = PerformanceSerializer
    permission_classes = [IsAuthenticated, ReadOnlyForStudents]

    def get_queryset(self):
        queryset = filter_queryset_by_role(
            Performance.objects.select_related('athlete').all(), self.request.user
        )
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        return queryset

    def perform_create(self, serializer):
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Students cannot create performance records.')
        serializer.save(recorded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Performance dashboard data for charts."""
        queryset = self.get_queryset()
        athlete_id = request.query_params.get('athlete_id')
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
    """Injury records — students: own data read-only."""
    queryset = Injury.objects.select_related('athlete').all()
    serializer_class = InjurySerializer
    permission_classes = [IsAuthenticated, ReadOnlyForStudents]

    def get_queryset(self):
        queryset = filter_queryset_by_role(
            Injury.objects.select_related('athlete').all(), self.request.user
        )
        athlete_id = self.request.query_params.get('athlete_id')
        recovery_status = self.request.query_params.get('recovery_status')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        if recovery_status:
            queryset = queryset.filter(recovery_status=recovery_status)
        return queryset

    def perform_create(self, serializer):
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Students cannot create injury records.')
        serializer.save()

    @action(detail=True, methods=['patch'])
    def update_recovery(self, request, pk=None):
        """Update recovery status — coach only."""
        if not is_staff_role(request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
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
    """Competitions — coach/admin only."""
    queryset = Competition.objects.prefetch_related('results').all()
    serializer_class = CompetitionSerializer
    permission_classes = [IsAuthenticated, IsCoachOrAdmin]

    @action(detail=True, methods=['post'])
    def add_result(self, request, pk=None):
        competition = self.get_object()
        data = request.data.copy()
        data['competition'] = competition.id
        serializer = CompetitionResultSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def medals(self, request):
        results = CompetitionResult.objects.all()
        return Response({
            'gold': results.filter(medal='Gold').count(),
            'silver': results.filter(medal='Silver').count(),
            'bronze': results.filter(medal='Bronze').count(),
            'total': results.exclude(medal='None').count(),
        })


class CompetitionResultViewSet(viewsets.ModelViewSet):
    """Competition results — coach/admin only."""
    queryset = CompetitionResult.objects.select_related('athlete', 'competition').all()
    serializer_class = CompetitionResultSerializer
    permission_classes = [IsAuthenticated, IsCoachOrAdmin]

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
    """Attendance — students view own; coaches manage all."""
    queryset = Attendance.objects.select_related('athlete').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, ReadOnlyForStudents]

    def get_queryset(self):
        queryset = filter_queryset_by_role(
            Attendance.objects.select_related('athlete').all(), self.request.user
        )
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
        if not is_staff_role(self.request.user):
            raise PermissionDenied('Students cannot mark attendance.')
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        if not is_staff_role(request.user):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
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
    """Weight tracking — coach/admin only."""
    queryset = WeightTracking.objects.select_related('athlete').all()
    serializer_class = WeightTrackingSerializer
    permission_classes = [IsAuthenticated, IsCoachOrAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()
        athlete_id = self.request.query_params.get('athlete_id')
        if athlete_id:
            queryset = queryset.filter(athlete_id=athlete_id)
        return queryset

    @action(detail=False, methods=['post'])
    def calculate_bmi(self, request):
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


# ==================== Health (keep-alive / deploy checks) ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'service': 'AthleteForge'})


# ==================== AI Insights ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_insights(request):
    """
    Rule-based AI insights: performance, injury risk, progress summary.
    ?athlete_id= for coaches; students get own athlete automatically.
    """
    athlete_id = request.query_params.get('athlete_id')

    if is_staff_role(request.user):
        if athlete_id:
            try:
                athlete = Athlete.objects.get(pk=athlete_id)
            except Athlete.DoesNotExist:
                return Response({'error': 'Athlete not found'}, status=404)
        else:
            athlete = Athlete.objects.first()
            if not athlete:
                return Response({'error': 'No athletes in system'}, status=404)
    else:
        athlete = get_athlete_for_user(request.user)
        if not athlete:
            return Response({
                'error': 'No athlete profile linked to your account. Contact your coach.',
            }, status=404)

    return Response(get_ai_insights_for_athlete(athlete))


@api_view(['GET'])
@permission_classes([AllowAny])
def ai_demo(request):
    """Public AI demo for landing-page copilot — no login required."""
    return Response(get_demo_ai_insights())


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_copilot(request):
    """Answer a natural-language question using full AI insights bundle."""
    question = (request.data.get('question') or '').strip()
    athlete_id = request.data.get('athlete_id')

    if request.user.is_authenticated:
        if is_staff_role(request.user):
            if athlete_id:
                try:
                    athlete = Athlete.objects.get(pk=athlete_id)
                except Athlete.DoesNotExist:
                    return Response({'error': 'Athlete not found'}, status=404)
            else:
                athlete = Athlete.objects.first()
                if not athlete:
                    return Response({'error': 'No athletes in system'}, status=404)
        else:
            athlete = get_athlete_for_user(request.user)
            if not athlete:
                return Response({'error': 'No athlete profile linked.'}, status=404)
        insights = get_ai_insights_for_athlete(athlete)
    else:
        insights = get_demo_ai_insights()

    if not question:
        return Response({
            'answer': insights.get('coaching_brief', '')[:900],
            'insights': insights,
        })

    return Response({
        'answer': answer_copilot_question(insights, question),
        'insights': insights,
    })


# ==================== Dashboard ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Dashboard statistics — full for coaches, personal for students."""
    user = request.user

    if is_staff_role(user):
        athletes = Athlete.objects.all()
        injuries = Injury.objects.exclude(recovery_status='Recovered')
        performances = Performance.objects.all()
        competitions = Competition.objects.all()
        results = CompetitionResult.objects.all()
        attendance = Attendance.objects.all()
        role = 'coach'
    else:
        athlete = get_athlete_for_user(user)
        if not athlete:
            return Response({
                'role': 'student',
                'linked': False,
                'message': 'Your account is not linked to an athlete profile yet. Contact your coach or use the same email as your athlete record.',
                'total_athletes': 0,
                'active_athletes': 0,
                'injured_athletes': 0,
                'active_injuries': 0,
                'total_competitions': 0,
                'gold_medals': 0,
                'silver_medals': 0,
                'bronze_medals': 0,
                'avg_performance': {'speed': 0, 'strength': 0, 'endurance': 0, 'flexibility': 0, 'agility': 0},
                'sport_distribution': [],
                'injury_by_severity': [],
                'monthly_attendance': [],
                'performance_trend': [],
                'athlete': None,
            })
        athletes = Athlete.objects.filter(pk=athlete.pk)
        injuries = athlete.injuries.exclude(recovery_status='Recovered')
        performances = athlete.performances.all()
        competitions = Competition.objects.filter(results__athlete=athlete).distinct()
        results = athlete.competition_results.all()
        attendance = athlete.attendance_records.all()
        role = 'student'

    avg_perf = performances.aggregate(
        speed=Avg('speed_score'),
        strength=Avg('strength_score'),
        endurance=Avg('endurance_score'),
        flexibility=Avg('flexibility_score'),
        agility=Avg('agility_score'),
    )

    sport_dist = list(athletes.values('sport').annotate(count=Count('id')).order_by('-count'))
    injury_severity = list(injuries.values('severity').annotate(count=Count('id')))

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

    payload = {
        'role': role,
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
    }

    if role == 'student':
        athlete = get_athlete_for_user(user)
        payload['athlete'] = AthleteSerializer(athlete, context={'request': request}).data
        payload['ai_preview'] = get_ai_insights_for_athlete(athlete)

    return Response(payload)


# ==================== Reports ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsCoachOrAdmin])
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
@permission_classes([IsAuthenticated, IsCoachOrAdmin])
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


# ==================== Admin Management ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminOnly])
def admin_dashboard_stats(request):
    """Admin control panel — system overview and user breakdown."""
    users = User.objects.all()
    profiles = UserProfile.objects.all()

    role_counts = {
        'admin': profiles.filter(role='admin').count() + users.filter(is_superuser=True).count(),
        'coach': profiles.filter(role='coach').count(),
        'student': profiles.filter(role='student').count(),
    }

    recent_users = users.order_by('-date_joined')[:8]
    injuries = Injury.objects.exclude(recovery_status='Recovered')

    return Response({
        'total_users': users.count(),
        'active_users': users.filter(is_active=True).count(),
        'inactive_users': users.filter(is_active=False).count(),
        'users_by_role': role_counts,
        'total_athletes': Athlete.objects.count(),
        'active_athletes': Athlete.objects.filter(status='Active').count(),
        'injured_athletes': Athlete.objects.filter(status='Injured').count(),
        'active_injuries': injuries.count(),
        'total_competitions': Competition.objects.count(),
        'total_performance_records': Performance.objects.count(),
        'total_attendance_records': Attendance.objects.count(),
        'recent_users': AdminUserSerializer(recent_users, many=True).data,
        'unlinked_students': profiles.filter(role='student', athlete__isnull=True).count(),
    })


class AdminUserViewSet(viewsets.ViewSet):
    """Admin user management — list, create, update, deactivate users."""
    permission_classes = [IsAuthenticated, IsAdminOnly]

    def list(self, request):
        """List all users with optional ?role= and ?search= filters."""
        queryset = User.objects.select_related('profile').order_by('-date_joined')
        role = request.query_params.get('role')
        search = request.query_params.get('search')

        if role:
            if role == 'admin':
                queryset = queryset.filter(
                    Q(is_superuser=True) | Q(profile__role='admin')
                )
            else:
                queryset = queryset.filter(profile__role=role)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        return Response(AdminUserSerializer(queryset, many=True).data)

    def create(self, request):
        """Create a new coach or student account."""
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            AdminUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        return Response(AdminUserSerializer(user).data)

    def partial_update(self, request, pk=None):
        """Update role, athlete link, active status, or name."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if user == request.user and request.data.get('is_active') is False:
            return Response({'error': 'Cannot deactivate your own account'}, status=400)
        if user.is_superuser and request.data.get('role') not in (None, 'admin'):
            return Response({'error': 'Cannot change superuser role'}, status=400)

        serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'is_active' in data:
            user.is_active = data['is_active']
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'coach'})
        if 'role' in data:
            profile.role = data['role']
        if 'athlete_id' in data:
            profile.athlete_id = data['athlete_id']
        profile.save()

        return Response(AdminUserSerializer(user).data)

    def destroy(self, request, pk=None):
        """Soft-delete: deactivate user account."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        if user == request.user:
            return Response({'error': 'Cannot deactivate your own account'}, status=400)
        user.is_active = False
        user.save()
        return Response({'message': f'User {user.username} deactivated'})