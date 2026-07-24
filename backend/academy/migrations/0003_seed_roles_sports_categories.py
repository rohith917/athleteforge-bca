"""
Seeds the 14 system roles (with sensible default Django permissions),
the sport-specific learning pathways, and the general sports-science
course taxonomy. Pure data — safe to re-run, idempotent via get_or_create.

Historical models (via apps.get_model) bypass the real models' custom
save() methods, so every slug is computed and passed explicitly here.
"""
from django.db import migrations
from django.utils.text import slugify


SYSTEM_ROLES = [
    ('super_admin', 'Super Admin', 'Full platform control: settings, orgs, users, security, audit.'),
    ('org_admin', 'Organization Admin', 'Manages coaches, athletes, courses, and programs within one organization.'),
    ('head_coach', 'Head Coach', 'Builds training plans and courses, monitors athletes, prepares competitions.'),
    ('assistant_coach', 'Assistant Coach', 'Records attendance and performance, helps deliver sessions.'),
    ('strength_conditioning_coach', 'Strength & Conditioning Coach', 'Owns strength/speed/plyo/mobility programming and load management.'),
    ('physiotherapist', 'Physiotherapist', 'Injury records, medical notes, rehab and return-to-play plans.'),
    ('nutritionist', 'Nutritionist', 'Meal plans, hydration, weight management, nutrition reports.'),
    ('sports_psychologist', 'Sports Psychologist', 'Mental training, goal setting, competition preparation notes.'),
    ('athlete', 'Athlete', 'Learns courses, tracks training, logs recovery, views feedback.'),
    ('parent', 'Parent', 'Read-only visibility into a linked athlete’s attendance, progress, and schedule.'),
    ('referee', 'Referee', 'Views schedules, scores matches, submits results.'),
    ('event_organizer', 'Event Organizer', 'Creates competitions, manages registrations and results.'),
    ('sports_scientist', 'Sports Scientist', 'Analyzes testing data, builds reports and research content.'),
    ('guest', 'Guest', 'Limited access to public courses and public rankings.'),
]

# (app_label, model_name, actions) — actions subset of add/change/delete/view
ROLE_PERMISSION_MAP = {
    'super_admin': 'all',
    'org_admin': [
        ('academy', None, ['add', 'change', 'delete', 'view']),
        ('api', None, ['add', 'change', 'delete', 'view']),
    ],
    'head_coach': [
        ('academy', 'course', ['add', 'change', 'view']),
        ('academy', 'coursemodule', ['add', 'change', 'view']),
        ('academy', 'lesson', ['add', 'change', 'view']),
        ('academy', 'enrollment', ['view']),
        ('academy', 'certificate', ['view']),
        ('api', 'athlete', ['add', 'change', 'view']),
        ('api', 'performance', ['add', 'change', 'view']),
        ('api', 'injury', ['add', 'change', 'view']),
        ('api', 'competition', ['add', 'change', 'view']),
        ('api', 'attendance', ['add', 'change', 'view']),
        ('api', 'weighttracking', ['add', 'change', 'view']),
        ('api', 'goal', ['add', 'change', 'view']),
        ('api', 'announcement', ['add', 'change', 'view']),
    ],
    'assistant_coach': [
        ('api', 'athlete', ['view']),
        ('api', 'attendance', ['add', 'change', 'view']),
        ('api', 'performance', ['add', 'view']),
        ('academy', 'course', ['view']),
        ('academy', 'lesson', ['view']),
    ],
    'strength_conditioning_coach': [
        ('api', 'performance', ['add', 'change', 'view']),
        ('api', 'weighttracking', ['add', 'change', 'view']),
        ('api', 'athlete', ['view']),
        ('academy', 'course', ['view']),
        ('academy', 'lesson', ['add', 'change', 'view']),
    ],
    'physiotherapist': [
        ('api', 'injury', ['add', 'change', 'view']),
        ('api', 'athlete', ['view']),
    ],
    'nutritionist': [
        ('api', 'weighttracking', ['add', 'change', 'view']),
        ('api', 'athlete', ['view']),
    ],
    'sports_psychologist': [
        ('api', 'athlete', ['view']),
        ('api', 'goal', ['add', 'change', 'view']),
    ],
    'athlete': [
        ('academy', 'course', ['view']),
        ('academy', 'lesson', ['view']),
        ('academy', 'enrollment', ['add', 'view']),
        ('academy', 'lessonprogress', ['add', 'change', 'view']),
        ('academy', 'quizattempt', ['add', 'view']),
        ('academy', 'certificate', ['view']),
        ('academy', 'assignmentsubmission', ['add', 'view']),
    ],
    'parent': [
        ('academy', 'certificate', ['view']),
    ],
    'referee': [
        ('api', 'competition', ['view']),
        ('api', 'competitionresult', ['add', 'change', 'view']),
    ],
    'event_organizer': [
        ('api', 'competition', ['add', 'change', 'view']),
        ('api', 'competitionresult', ['add', 'change', 'view']),
    ],
    'sports_scientist': [
        ('api', 'performance', ['view']),
        ('api', 'athlete', ['view']),
        ('academy', 'researchsummary', ['add', 'change', 'view']),
    ],
    'guest': [
        ('academy', 'course', ['view']),
    ],
}

SPORTS = [
    'Taekwondo', 'Karate', 'Judo', 'Boxing', 'Wrestling', 'Athletics', 'Football',
    'Basketball', 'Volleyball', 'Badminton', 'Swimming', 'Cycling', 'Cricket',
    'Gymnastics', 'Weightlifting', 'Powerlifting',
]

# (name, [child names]) — general sports-science taxonomy, platform-wide (sport=None)
GENERAL_CATEGORIES = [
    ('Sports Science Foundations', []),
    ('Human Anatomy for Athletes', []),
    ('Exercise Physiology', []),
    ('Sports Biomechanics', []),
    ('Sports Psychology', []),
    ('Sports Nutrition', []),
    ('Hydration', []),
    ('Recovery Science', []),
    ('Sleep Optimization', []),
    ('Injury Prevention', []),
    ('Return-to-Sport Concepts', []),
    ('Movement Screening', []),
    ('Performance Testing & Assessment', []),
    ('Monitoring Training Load', []),
    ('Periodization', []),
    ('Periodization Cycles', ['Macrocycle', 'Mesocycle', 'Microcycle']),
    ('Training Phases', [
        'Off-Season', 'Pre-Season', 'In-Season', 'Competition Phase', 'Peak Phase', 'Transition Phase',
    ]),
    ('Warm-Up Systems', [
        'General Warm-Up', 'Specific Warm-Up', 'Dynamic Warm-Up', 'Static Warm-Up',
        'Neural Activation', 'Movement Preparation', 'Sport-Specific Warm-Up',
    ]),
    ('Cool-Down Systems', []),
    ('Stretching', []),
    ('Mobility', []),
    ('Flexibility', []),
    ('Stability & Balance', []),
    ('Coordination & Reaction', []),
    ('Speed Development', []),
    ('Agility', []),
    ('Power Development', []),
    ('Strength Training', []),
    ('Endurance Training', []),
    ('Plyometrics', []),
    ('Training Methods', [
        'Isometric Training', 'Eccentric Training', 'Concentric Training', 'Tempo Training',
        'Cluster Training', 'Contrast Training', 'Complex Training', 'Velocity-Based Training',
        'Olympic Lifting Concepts', 'Functional Training', 'Corrective Exercise',
        'Tendon Training', 'Fascial Training',
    ]),
    ('Energy Systems', ['VO2 Max', 'HIIT', 'Sprint Interval Training']),
    ('Recovery Methods', [
        'Foam Rolling', 'Breathing Techniques', 'Cold Therapy', 'Heat Therapy',
        'Compression', 'Massage', 'Active Recovery',
    ]),
    ('Program Design', []),
    ('Coach Education', []),
    ('Competition Preparation', []),
    ('Leadership & Communication', []),
    ('Ethics in Sport', []),
    ('Anti-Doping Education', []),
]

SPORT_SUBTOPICS = [
    'Physical Demands', 'Movement Analysis', 'Annual Planning', 'Training Methods',
    'Testing', 'Performance Development', 'Recovery', 'Injury Prevention', 'Competition Preparation',
]


def seed(apps, schema_editor):
    OrgRole = apps.get_model('academy', 'OrgRole')
    Sport = apps.get_model('academy', 'Sport')
    CourseCategory = apps.get_model('academy', 'CourseCategory')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    for slug, name, description in SYSTEM_ROLES:
        role, _ = OrgRole.objects.get_or_create(
            slug=slug, organization=None,
            defaults={'name': name, 'description': description, 'is_system': True},
        )

        spec = ROLE_PERMISSION_MAP.get(slug)
        if spec == 'all':
            role.permissions.set(Permission.objects.all())
            continue
        if not spec:
            continue

        perms = []
        for app_label, model_name, actions in spec:
            cts = ContentType.objects.filter(app_label=app_label)
            if model_name:
                cts = cts.filter(model=model_name)
            ct_ids = list(cts.values_list('id', flat=True))
            if not ct_ids:
                continue
            for action in actions:
                perms += list(Permission.objects.filter(
                    content_type_id__in=ct_ids, codename__startswith=f'{action}_',
                ))
        role.permissions.set(perms)

    for sport_name in SPORTS:
        sport, _ = Sport.objects.get_or_create(
            name=sport_name, defaults={'slug': slugify(sport_name)},
        )
        for i, subtopic in enumerate(SPORT_SUBTOPICS):
            CourseCategory.objects.get_or_create(
                sport=sport, parent=None, slug=slugify(subtopic),
                defaults={'name': subtopic, 'order': i},
            )

    for order, (name, children) in enumerate(GENERAL_CATEGORIES):
        parent, _ = CourseCategory.objects.get_or_create(
            sport=None, parent=None, slug=slugify(name),
            defaults={'name': name, 'order': order},
        )
        for c_order, child_name in enumerate(children):
            CourseCategory.objects.get_or_create(
                sport=None, parent=parent, slug=slugify(child_name),
                defaults={'name': child_name, 'order': c_order},
            )


def unseed(apps, schema_editor):
    OrgRole = apps.get_model('academy', 'OrgRole')
    Sport = apps.get_model('academy', 'Sport')
    CourseCategory = apps.get_model('academy', 'CourseCategory')
    OrgRole.objects.filter(is_system=True).delete()
    CourseCategory.objects.all().delete()
    Sport.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('academy', '0002_alter_coursecategory_slug_and_more'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
