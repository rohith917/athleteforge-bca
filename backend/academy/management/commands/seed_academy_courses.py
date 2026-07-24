"""
Seeds real, fully-written pilot courses proving out the LMS pipeline end
to end (course -> modules -> lessons -> quiz -> completion -> certificate).

Content here is written in plain language from general, well-established
exercise-science knowledge (temperature/vasodilation effects, RAMP
protocol structure, progressive overload, etc.) — no invented citations
or fabricated "evidence levels". More courses follow this same pattern.

Usage: python manage.py seed_academy_courses
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from academy.models import (
    CourseCategory, Course, CourseModule, Lesson, LessonFAQ, Quiz, QuizQuestion, QuizChoice,
)


class Command(BaseCommand):
    help = 'Seed pilot Academy courses with real, complete lesson content'

    def handle(self, *args, **options):
        if Course.objects.exists():
            self.stdout.write(self.style.WARNING('Courses already exist. Skipping.'))
            return

        author = User.objects.filter(is_superuser=True).first()

        self._seed_warmup_course(author)
        self._seed_strength_course(author)

        self.stdout.write(self.style.SUCCESS('Seeded 2 pilot courses.'))

    def _seed_warmup_course(self, author):
        category = CourseCategory.objects.get(slug='warm-up-systems', sport=None)
        course = Course.objects.create(
            title='Warm-Up Systems: Foundations',
            subtitle='How to structure a warm-up that actually prepares athletes to perform',
            description=(
                'A practical, physiology-grounded introduction to warm-up design: why warming up '
                'works, the difference between general and specific preparation, and how to apply '
                'the RAMP protocol to any sport.'
            ),
            category=category,
            level='beginner',
            status='published',
            estimated_hours=1.0,
            created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Warm-Up Fundamentals', order=1)

        lessons = [
            dict(
                title='Why We Warm Up: The Physiology',
                lesson_type='text',
                order=1,
                estimated_minutes=8,
                learning_objectives='Explain the physiological changes a warm-up produces and why they matter for performance and injury risk.',
                content=(
                    'A warm-up is not a formality — it is a deliberate process of raising the body\'s '
                    'readiness to produce force, move through range, and tolerate high-intensity effort.'
                ),
                scientific_explanation=(
                    'Raising muscle temperature speeds up nerve conduction and the enzymatic reactions '
                    'behind muscle contraction, so muscles contract and relax faster. Blood vessels dilate '
                    '(vasodilation), improving oxygen and nutrient delivery to working muscles. Synovial '
                    'fluid in the joints becomes less viscous, reducing joint friction. Warmer muscle-tendon '
                    'units are also more compliant, which is associated with a lower risk of strain-type '
                    'injuries during subsequent high-intensity work.'
                ),
                practical_application=(
                    'A working warm-up gradually raises heart rate and breathing rate, produces light '
                    'sweating, and rehearses the movement patterns the session will use — it should leave '
                    'the athlete ready to move at speed, not fatigued.'
                ),
                key_coaching_points=(
                    'Progress from low to high intensity. Include movements specific to the sport. Keep '
                    'total duration proportional to session intensity — roughly 10-20 minutes for most '
                    'training sessions.'
                ),
                common_mistakes=(
                    'Skipping the warm-up under time pressure. Static stretching cold muscle as the very '
                    'first activity. Making the warm-up so long or intense it fatigues the athlete before '
                    'the main session.'
                ),
                safety_considerations=(
                    'Athletes returning from injury often need a longer, more gradual warm-up. Watch for '
                    'pain during warm-up movements before allowing the athlete to progress intensity.'
                ),
                summary='Warm-up physiologically primes the neuromuscular and cardiovascular systems and rehearses movement patterns before higher-intensity work.',
                references='General exercise physiology principles (muscle temperature and conduction velocity, exercise-induced vasodilation).',
                faqs=[
                    ('Can you warm up too much?', 'Yes — an overly long or intense warm-up can create fatigue that reduces performance in the main session. Keep it proportional to what follows.'),
                    ('Is a warm-up needed before every session, even light ones?', 'Some preparation is still worthwhile, but a light technical session needs less than a maximal-effort or high-speed session.'),
                ],
            ),
            dict(
                title='General vs Specific Warm-Up',
                lesson_type='text',
                order=2,
                estimated_minutes=7,
                learning_objectives='Distinguish general from specific warm-up components and sequence them correctly.',
                content='Effective warm-ups move from broad, whole-body preparation into movements that closely resemble the activity ahead.',
                scientific_explanation=(
                    'A general warm-up raises whole-body temperature and heart rate through non-specific '
                    'movement such as jogging, cycling, or skipping. A specific warm-up then rehearses the '
                    'joint ranges, movement patterns, and energy systems that closely resemble the upcoming '
                    'activity, priming the exact neuromuscular pathways that will be used.'
                ),
                practical_application='Sequence general warm-up first (roughly 5-8 minutes), then specific warm-up (5-10 minutes) that mimics sport movements at progressively higher intensity.',
                key_coaching_points='Match the specific phase to the actual demands of the session — a sprinter\'s specific warm-up looks different from a swimmer\'s.',
                common_mistakes='Jumping straight into specific, high-intensity movement without any general preparation first.',
                safety_considerations='Progress intensity gradually within the specific phase rather than jumping straight to maximal effort.',
                summary='General warm-up prepares the whole body; specific warm-up prepares the exact movement patterns about to be used.',
                references='Standard warm-up structuring principles used in strength & conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Dynamic vs Static Warm-Up',
                lesson_type='text',
                order=3,
                estimated_minutes=7,
                learning_objectives='Explain when dynamic stretching is preferable to static stretching within a warm-up.',
                content='Dynamic and static stretching serve different purposes and belong in different parts of a training day.',
                scientific_explanation=(
                    'Dynamic stretching moves a joint through its range using controlled, sport-relevant '
                    'movement (leg swings, walking lunges), which raises temperature while it lengthens '
                    'tissue. Static stretching holds a lengthened position without movement; done at length '
                    'and cold, it can temporarily reduce muscular power output, which is why it is generally '
                    'placed after activity rather than immediately before high-intensity work.'
                ),
                practical_application='Favor dynamic stretching within the warm-up itself; reserve longer static stretching for the cool-down or a separate mobility session.',
                key_coaching_points='Dynamic drills should be controlled, not ballistic/bouncing, especially for athletes with limited mobility.',
                common_mistakes='Long, held static stretches as the first thing an athlete does before a power or sprint session.',
                safety_considerations='Athletes with hypermobility should avoid stretching into end-range without control.',
                summary='Use dynamic movement to prepare for performance; save static stretching for after training.',
                references='General principles from warm-up and flexibility training literature.',
                faqs=[],
            ),
            dict(
                title='The RAMP Warm-Up Protocol',
                lesson_type='text',
                order=4,
                estimated_minutes=10,
                learning_objectives='Apply the RAMP framework (Raise, Activate & Mobilize, Potentiate) to design a complete warm-up.',
                content=(
                    'RAMP is a simple, widely-used framework for structuring a warm-up into four purposeful stages: '
                    'Raise, Activate, Mobilize, and Potentiate.'
                ),
                scientific_explanation=(
                    'Raise: elevate heart rate, breathing rate, and muscle temperature through light continuous '
                    'movement. Activate & Mobilize: engage key stabilizing muscles and move joints through the '
                    'ranges needed for the session. Potentiate: perform progressively higher-intensity, '
                    'sport-specific movements that prime the nervous system for the main session\'s demands.'
                ),
                practical_application=(
                    'Example 20-minute RAMP warm-up: 5 min light jog/cycle (Raise); 6 min mobility drills and '
                    'activation exercises for the muscles the session will stress (Activate & Mobilize); '
                    '6-8 min progressively faster sport-specific drills, e.g. build-up sprints or change-of-direction '
                    'reps (Potentiate).'
                ),
                key_coaching_points='Each phase should visibly build on the last — the athlete should feel measurably more ready to move by the end of Potentiate.',
                common_mistakes='Treating RAMP as a fixed checklist rather than adjusting each phase\'s length to the session and the individual athlete.',
                safety_considerations='Reduce the Potentiate phase\'s intensity for athletes managing an injury, and monitor closely.',
                summary='RAMP gives a repeatable structure — Raise, Activate & Mobilize, Potentiate — for building any sport\'s warm-up.',
                references='RAMP protocol structure as commonly taught in strength & conditioning coach education.',
                faqs=[
                    ('Does RAMP replace sport-specific technical warm-up drills?', 'No — RAMP is the structure; the Potentiate phase is exactly where sport-specific technical drills belong.'),
                ],
                quiz=dict(
                    title='RAMP Protocol Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='What does the "R" in RAMP stand for?',
                            explanation='Raise is the first phase: elevating heart rate, breathing, and muscle temperature.',
                            choices=[('Raise', True), ('Recover', False), ('Repeat', False), ('Rest', False)],
                        ),
                        dict(
                            question_text='Which phase includes progressively higher-intensity, sport-specific movement?',
                            explanation='Potentiate is the final phase, priming the nervous system for the session\'s actual demands.',
                            choices=[('Raise', False), ('Activate & Mobilize', False), ('Potentiate', True)],
                        ),
                        dict(
                            question_text='Why is long, held static stretching generally avoided as the very first warm-up activity?',
                            explanation='On cold muscle, it can temporarily reduce power output — better suited to the cool-down.',
                            choices=[
                                ('It has no effect either way', False),
                                ('It can temporarily reduce muscular power output when done cold', True),
                                ('It raises heart rate too much', False),
                            ],
                        ),
                    ],
                ),
            ),
        ]

        self._create_lessons(module, lessons)

    def _seed_strength_course(self, author):
        category = CourseCategory.objects.get(slug='strength-training', sport=None)
        course = Course.objects.create(
            title='Strength Training Foundations',
            subtitle='Core principles behind building a safe, effective strength program',
            description=(
                'Covers progressive overload, exercise technique fundamentals, and how to program '
                'strength work sensibly for developing athletes.'
            ),
            category=category,
            level='beginner',
            status='published',
            estimated_hours=0.6,
            created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Strength Training Basics', order=1)

        lessons = [
            dict(
                title='Progressive Overload',
                lesson_type='text',
                order=1,
                estimated_minutes=8,
                learning_objectives='Explain progressive overload and identify the main ways to apply it.',
                content='Strength adaptation requires a training stimulus that gradually increases over time.',
                scientific_explanation=(
                    'Muscles and connective tissue adapt to the demands placed on them. If the training '
                    'stimulus never increases, the body has no reason to keep adapting, and progress '
                    'plateaus. Progressive overload is the gradual, planned increase of training demand — '
                    'through load, volume, or difficulty — that keeps driving adaptation over time.'
                ),
                practical_application=(
                    'Overload can be applied by increasing load (more weight), volume (more sets/reps), '
                    'density (less rest), or exercise difficulty (a harder variation), typically one '
                    'variable at a time.'
                ),
                key_coaching_points='Increase demand in small, manageable steps rather than large jumps that compromise technique.',
                common_mistakes='Increasing load before technique is consistent; increasing several variables (load, volume, difficulty) at once.',
                safety_considerations='Young or novice athletes should prioritize technique mastery before adding significant load.',
                summary='Consistent, gradual increases in training demand are what drive long-term strength gains.',
                references='Foundational strength training and program design principles.',
                faqs=[],
            ),
            dict(
                title='Exercise Technique Fundamentals',
                lesson_type='text',
                order=2,
                estimated_minutes=9,
                learning_objectives='Identify the technique checkpoints that apply across most strength exercises.',
                content='Technique determines both how safely and how effectively an exercise builds strength.',
                scientific_explanation=(
                    'Consistent joint positioning and a controlled bar/load path keep force directed through '
                    'the muscles the exercise is meant to train, and away from vulnerable joint positions. '
                    'Technique breakdown under fatigue is one of the more common contributors to acute '
                    'training injuries.'
                ),
                practical_application='Coach a small, repeatable checklist per exercise (e.g. for a squat: braced core, neutral spine, knees tracking over toes, controlled depth).',
                key_coaching_points='Cue one or two things at a time; reduce load or stop the set once technique breaks down.',
                common_mistakes='Chasing load or rep count at the expense of visible technique breakdown.',
                safety_considerations='Stop a set immediately if an athlete reports joint pain (distinct from normal muscular fatigue).',
                progressions='Add load or a harder variation only once technique is consistently solid at the current level.',
                regressions='Reduce load, range of motion, or move to a simpler exercise variation to rebuild technique.',
                summary='Solid, repeatable technique is what makes an exercise both safe and effective — build it before chasing load.',
                references='General resistance-training coaching practice.',
                faqs=[],
            ),
        ]

        self._create_lessons(module, lessons)

    def _create_lessons(self, module, lessons):
        for data in lessons:
            faqs = data.pop('faqs', [])
            quiz_data = data.pop('quiz', None)
            lesson = Lesson.objects.create(module=module, is_published=True, **data)

            for order, (question, answer) in enumerate(faqs):
                LessonFAQ.objects.create(lesson=lesson, question=question, answer=answer, order=order)

            if quiz_data:
                quiz = Quiz.objects.create(
                    lesson=lesson,
                    title=quiz_data['title'],
                    passing_score_percent=quiz_data['passing_score_percent'],
                )
                for q_order, q in enumerate(quiz_data['questions']):
                    question = QuizQuestion.objects.create(
                        quiz=quiz, question_text=q['question_text'],
                        explanation=q['explanation'], order=q_order,
                    )
                    for c_order, (choice_text, is_correct) in enumerate(q['choices']):
                        QuizChoice.objects.create(
                            question=question, choice_text=choice_text,
                            is_correct=is_correct, order=c_order,
                        )
