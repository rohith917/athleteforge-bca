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
    CourseCategory, Course, CourseModule, Lesson, LessonFAQ, Quiz, QuizQuestion, QuizChoice, Sport,
)


class Command(BaseCommand):
    help = 'Seed pilot Academy courses with real, complete lesson content'

    def handle(self, *args, **options):
        author = User.objects.filter(is_superuser=True).first()
        seeders = [
            ('warm-up-systems-foundations', self._seed_warmup_course),
            ('strength-training-foundations', self._seed_strength_course),
            ('cool-down-systems-foundations', self._seed_cooldown_course),
            ('recovery-science-foundations', self._seed_recovery_course),
            ('injury-prevention-fundamentals', self._seed_injury_prevention_course),
            ('periodization-basics', self._seed_periodization_course),
            ('football-physical-demands', self._seed_football_physical_demands_course),
        ]

        created = 0
        for slug, seeder in seeders:
            if Course.objects.filter(slug=slug).exists():
                continue
            seeder(author)
            created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'Seeded {created} new course(s).'))
        else:
            self.stdout.write(self.style.WARNING('All seed courses already exist. Nothing to do.'))

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

    def _seed_cooldown_course(self, author):
        category = CourseCategory.objects.get(slug='cool-down-systems', sport=None)
        course = Course.objects.create(
            title='Cool-Down Systems: Foundations',
            subtitle='Why and how to bring a training session down properly',
            description='Covers the purpose of a cool-down, static stretching timing, and active recovery options.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Cool-Down Basics', order=1)

        lessons = [
            dict(
                title='Why Cool-Down Matters',
                lesson_type='text', order=1, estimated_minutes=6,
                learning_objectives='Explain what a cool-down is intended to achieve after training.',
                content='A cool-down transitions the body from high exertion back toward a resting state in a controlled way.',
                scientific_explanation=(
                    'Light continued movement after intense exercise helps maintain blood flow (the "muscle pump") '
                    'back toward the heart, rather than blood pooling in the limbs when activity stops abruptly. '
                    'It also gives heart rate and breathing time to return toward baseline gradually.'
                ),
                practical_application='5-10 minutes of light continuous movement (easy jog, cycle, or walk) at the end of a session, before static stretching.',
                key_coaching_points='Keep intensity low and let effort taper off gradually rather than stopping abruptly.',
                common_mistakes='Stopping training abruptly and sitting down immediately after maximal effort.',
                safety_considerations='Athletes who feel light-headed after intense effort should be seated/monitored rather than pushed through a cool-down.',
                summary='A cool-down gradually lowers heart rate and supports circulation after intense effort.',
                references='General exercise physiology principles on post-exercise recovery.',
                faqs=[],
            ),
            dict(
                title='Static Stretching After Training',
                lesson_type='text', order=2, estimated_minutes=6,
                learning_objectives='Explain why static stretching is generally better placed after training than before.',
                content='The cool-down is a natural place for longer, held stretches.',
                scientific_explanation=(
                    'Muscle temperature is already elevated post-training, and there is no upcoming power/speed '
                    'demand to protect against the temporary force reduction associated with stretching cold, '
                    'pre-activity muscle.'
                ),
                practical_application='Hold each major muscle group stretch for roughly 20-30 seconds, without bouncing, staying within a comfortable range.',
                key_coaching_points='Stretch to a point of mild tension, not pain.',
                common_mistakes='Stretching aggressively into pain, or bouncing into the stretch.',
                safety_considerations='Athletes with recent muscle strains should stretch gently and stop short of any pain.',
                summary='Static stretching fits naturally into the cool-down, when there is no upcoming power demand to protect.',
                references='General flexibility training principles.',
                faqs=[],
            ),
            dict(
                title='Active Recovery Cool-Down',
                lesson_type='text', order=3, estimated_minutes=6,
                learning_objectives='Distinguish active recovery from passive rest as a cool-down option.',
                content='Active recovery uses light movement rather than complete rest to support recovery.',
                scientific_explanation='Light aerobic movement keeps circulation elevated slightly longer than immediate rest, which some athletes find helps reduce the sensation of stiffness afterward.',
                practical_application='A light 5-10 minute walk, easy spin on a bike, or light pool movement can serve as active recovery after a hard session.',
                key_coaching_points='Keep effort clearly easy — this is not extra training volume.',
                common_mistakes='Making "active recovery" intense enough that it becomes additional training load.',
                safety_considerations='Not a substitute for rest on days where the athlete needs genuine full recovery.',
                summary='Active recovery is optional light movement that can complement — not replace — proper rest.',
                references='General recovery-methods coaching practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_recovery_course(self, author):
        category = CourseCategory.objects.get(slug='recovery-science', sport=None)
        course = Course.objects.create(
            title='Recovery Science: Foundations',
            subtitle='How the body adapts between sessions, and how to support that process',
            description='Covers the stimulus-recovery-adaptation cycle, sleep\'s role in recovery, and active vs passive recovery choices.',
            category=category, level='beginner', status='published', estimated_hours=0.7, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Recovery Fundamentals', order=1)

        lessons = [
            dict(
                title='The Stimulus-Recovery-Adaptation Cycle',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain why recovery is where actual fitness adaptation happens.',
                content='Training provides a stimulus; the body adapts to it during the recovery period that follows, not during the session itself.',
                scientific_explanation=(
                    'A hard training session temporarily reduces the body\'s capacity (fatigue). Give it adequate '
                    'recovery time and nutrition, and the body rebuilds slightly stronger than before — this is '
                    'the basis of the supercompensation model behind most training theory. Insufficient recovery '
                    'between sessions prevents this rebuild from completing before the next stimulus arrives.'
                ),
                practical_application='Plan recovery time into the training week deliberately, not just as "whatever is left over."',
                key_coaching_points='Harder sessions need proportionally more recovery time before the next hard effort.',
                common_mistakes='Treating recovery as optional or a sign of insufficient work ethic.',
                safety_considerations='Persistent underperformance despite training hard is a signal to review recovery, not just increase training volume further.',
                summary='Adaptation happens during recovery, not during the workout itself — recovery is part of training, not separate from it.',
                references='General training theory (stimulus-fatigue-recovery-adaptation model).',
                faqs=[],
            ),
            dict(
                title='Sleep and Recovery',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Explain why sleep is one of the highest-leverage recovery tools available.',
                content='Sleep is when a large share of the body\'s repair and hormonal recovery processes occur.',
                scientific_explanation='During deep sleep stages, the body releases growth hormone involved in tissue repair, and the nervous system consolidates motor learning from the day\'s training.',
                practical_application='Prioritize consistent sleep duration and timing, especially around high training-load periods.',
                key_coaching_points='Treat sleep as a trainable habit: consistent bed/wake times, a wind-down routine, a dark and cool room.',
                common_mistakes='Cutting sleep to fit in extra training or screen time, especially before competition.',
                safety_considerations='Chronic poor sleep is associated with higher injury risk in athletes; flag persistent sleep problems.',
                summary='Sleep is one of the most effective, lowest-cost recovery tools available to any athlete.',
                references='General sleep and exercise-recovery physiology.',
                faqs=[
                    ('How much sleep do athletes need?', 'Individual needs vary, but many young athletes benefit from more than the general adult recommendation, particularly during heavy training blocks.'),
                ],
            ),
            dict(
                title='Active vs Passive Recovery',
                lesson_type='text', order=3, estimated_minutes=8,
                learning_objectives='Compare active and passive recovery approaches and when each fits.',
                content='Recovery days can be either genuinely restful (passive) or filled with light movement (active) — both have a place.',
                scientific_explanation='Passive recovery (full rest) minimizes additional stress. Active recovery (light movement) can support circulation and may reduce perceived stiffness without adding meaningful training load, provided intensity stays genuinely low.',
                practical_application='Alternate based on how fatigued the athlete is — a very fatigued athlete usually benefits more from passive rest than from more movement.',
                key_coaching_points='Match the recovery method to actual fatigue level, not a fixed weekly template.',
                common_mistakes='Defaulting to "active recovery" as an excuse to add more training volume.',
                safety_considerations='Highly fatigued or injured athletes should default to passive rest unless specifically guided otherwise.',
                summary='Both active and passive recovery are legitimate tools — the right choice depends on how fatigued the athlete actually is.',
                references='General recovery-methods coaching practice.',
                faqs=[],
                quiz=dict(
                    title='Recovery Fundamentals Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='When does the body actually adapt and get fitter?',
                            explanation='Adaptation happens during recovery after the stimulus, not during the workout itself.',
                            choices=[('During the workout itself', False), ('During the recovery period after the workout', True), ('It happens instantly', False)],
                        ),
                        dict(
                            question_text='What is released during deep sleep that supports tissue repair?',
                            explanation='Growth hormone release during deep sleep is linked to tissue repair processes.',
                            choices=[('Growth hormone', True), ('Adrenaline', False), ('Lactate', False)],
                        ),
                        dict(
                            question_text='A highly fatigued athlete is generally better served by which recovery approach?',
                            explanation='When fatigue is high, passive rest is usually the safer default over adding more movement.',
                            choices=[('Passive rest', True), ('A hard second session', False), ('Active recovery at high intensity', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_injury_prevention_course(self, author):
        category = CourseCategory.objects.get(slug='injury-prevention', sport=None)
        course = Course.objects.create(
            title='Injury Prevention Fundamentals',
            subtitle='Understanding load, common risk factors, and basic movement screening',
            description='Introduces why athletes get injured, how training load contributes, and the basics of movement screening.',
            category=category, level='intermediate', status='published', estimated_hours=0.8, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Injury Prevention Basics', order=1)

        lessons = [
            dict(
                title='Why Athletes Get Injured',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Distinguish contact and non-contact injury risk factors.',
                content='Injuries broadly split into contact injuries (collisions, contact with equipment) and non-contact injuries (often related to load, fatigue, or movement quality).',
                scientific_explanation='Non-contact injuries are frequently linked to a mismatch between the load placed on tissue and that tissue\'s current capacity to tolerate it — often from a rapid increase in training demand, accumulated fatigue, or a movement pattern that repeatedly stresses the same structure.',
                practical_application='Track training load changes over time and watch for athletes reporting persistent, localized discomfort rather than normal, diffuse muscle soreness.',
                key_coaching_points='Distinguish normal training soreness (diffuse, improves with movement) from something that needs attention (localized, sharp, or worsening).',
                common_mistakes='Ignoring early, localized pain reports because an athlete wants to "push through it."',
                safety_considerations='Any sharp, localized, or worsening pain warrants reducing load and getting it assessed rather than continuing to train through it.',
                summary='Many non-contact injuries stem from a mismatch between training load and tissue capacity — tracking load and listening to pain reports both matter.',
                references='General sports-medicine injury-risk-factor principles.',
                faqs=[],
            ),
            dict(
                title='Load Management and the Acute:Chronic Workload Ratio',
                lesson_type='text', order=2, estimated_minutes=9,
                learning_objectives='Explain the concept of comparing recent training load to an athlete\'s established baseline.',
                content='One widely used way to think about injury risk is comparing an athlete\'s recent ("acute") training load to their longer-term ("chronic") average.',
                scientific_explanation='A large, rapid spike in training load relative to what an athlete\'s body has become accustomed to is associated with higher injury risk than the same absolute load reached gradually — the tissue simply hasn\'t had time to adapt to the new demand.',
                practical_application='Build training load up gradually over weeks, particularly after time off (injury, illness, off-season) rather than jumping straight back to previous peak loads.',
                key_coaching_points='Treat any return from a break as a progressive rebuild, not a resumption at the old level.',
                common_mistakes='Athletes returning from a break and immediately training at pre-break volume/intensity.',
                safety_considerations='Rapid load spikes are a particular concern after any period of reduced training.',
                summary='Gradual, progressive increases in training load are safer than sudden jumps, especially after time off.',
                references='General training-load-management principles used in sports science practice.',
                faqs=[],
            ),
            dict(
                title='Movement Screening Basics',
                lesson_type='text', order=3, estimated_minutes=9,
                learning_objectives='Describe the purpose of a basic movement screen.',
                content='A movement screen is a simple set of checks used to spot obvious movement-quality issues before they become a problem under load.',
                scientific_explanation='Screens typically assess fundamental patterns — squat, lunge, single-leg balance, overhead reach — looking for asymmetries or restricted ranges that might indicate a compensation pattern worth addressing before adding heavy load to that movement.',
                practical_application='Run a simple screen (e.g. bodyweight squat, single-leg balance hold, overhead reach) periodically, especially at the start of a new training block.',
                key_coaching_points='A screen flags where to look closer — it is not a diagnosis by itself.',
                common_mistakes='Treating a single screening result as a definitive diagnosis rather than a starting point for further attention.',
                safety_considerations='Significant, consistent asymmetries or pain during screening movements warrant referral to a qualified professional rather than continued loading.',
                summary='Basic movement screening is a low-cost way to catch obvious movement-quality issues before they become injuries.',
                references='General movement-screening principles used in strength & conditioning practice.',
                faqs=[],
                quiz=dict(
                    title='Injury Prevention Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='Non-contact injuries are often linked to a mismatch between what two things?',
                            explanation='Training load and the tissue\'s current capacity to tolerate that load.',
                            choices=[('Training load and tissue capacity', True), ('Diet and hydration only', False), ('Team size and pitch size', False)],
                        ),
                        dict(
                            question_text='After time off, how should training load generally be reintroduced?',
                            explanation='Gradually — a rapid return to previous peak load is linked to higher injury risk.',
                            choices=[('Immediately back to the previous peak level', False), ('Gradually, building back up', True), ('It does not matter', False)],
                        ),
                        dict(
                            question_text='What is a basic movement screen mainly used for?',
                            explanation='It flags asymmetries or restrictions worth a closer look — it is a starting point, not a diagnosis.',
                            choices=[('Diagnosing injuries definitively', False), ('Flagging movement-quality issues worth a closer look', True), ('Measuring cardiovascular fitness', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_periodization_course(self, author):
        category = CourseCategory.objects.get(slug='periodization', sport=None)
        course = Course.objects.create(
            title='Periodization Basics',
            subtitle='How to structure training over weeks, months, and a full season',
            description='Introduces macrocycle/mesocycle/microcycle planning and the difference between linear and undulating periodization.',
            category=category, level='intermediate', status='published', estimated_hours=0.7, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Periodization Fundamentals', order=1)

        lessons = [
            dict(
                title='What Is Periodization?',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Define periodization and explain why training is planned in phases rather than kept constant.',
                content='Periodization is the practice of deliberately varying training variables (volume, intensity, focus) over time rather than training the same way indefinitely.',
                scientific_explanation='Constantly training at the same volume and intensity leads to diminishing returns and higher staleness/injury risk over time. Planned variation lets the body adapt to a given stimulus, then progress to a new one, while managing fatigue around key competitive dates.',
                practical_application='Plan training in phases that build toward specific goals — e.g. a general preparation phase, followed by more sport-specific and competition-focused phases.',
                key_coaching_points='Identify the athlete\'s key competition dates first, then work backward to plan phases.',
                common_mistakes='Training at maximum intensity year-round with no planned variation.',
                safety_considerations='Sudden, unplanned jumps in intensity between phases carry the same load-spike risk covered in injury prevention.',
                summary='Periodization deliberately varies training over time so athletes peak when it matters, rather than training the same way indefinitely.',
                references='General periodization theory as taught in strength & conditioning coach education.',
                faqs=[],
            ),
            dict(
                title='Macrocycle, Mesocycle, Microcycle',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Define the three standard periodization timeframes.',
                content='Periodization is usually described at three nested timeframes.',
                scientific_explanation='A macrocycle is the largest timeframe — often a full season or year. It is broken into mesocycles, blocks of several weeks each with a specific focus (e.g. a strength-building block). Each mesocycle is made up of microcycles, typically one training week, which is where day-to-day session planning happens.',
                practical_application='Plan top-down: define the season (macrocycle), split it into focused blocks (mesocycles), then plan each week (microcycle) within its block\'s goal.',
                key_coaching_points='Every microcycle should clearly serve the goal of the mesocycle it sits inside.',
                common_mistakes='Planning individual weeks in isolation without a clear larger-block goal behind them.',
                safety_considerations='None specific — this is a planning framework, not a training stimulus itself.',
                summary='Macrocycle (season) -> mesocycle (block of weeks) -> microcycle (a week) is the standard nested structure for planning training over time.',
                references='General periodization terminology used in strength & conditioning practice.',
                faqs=[
                    ('How long is a typical mesocycle?', 'Commonly around 3-6 weeks, though it varies by sport, goal, and the athlete\'s training age.'),
                ],
            ),
            dict(
                title='Linear vs Undulating Periodization',
                lesson_type='text', order=3, estimated_minutes=8,
                learning_objectives='Compare linear and undulating periodization models.',
                content='Two common ways to structure how training variables change over time are linear and undulating periodization.',
                scientific_explanation='Linear periodization gradually shifts from higher volume/lower intensity toward lower volume/higher intensity over a block. Undulating periodization varies volume and intensity more frequently — sometimes within the same week — rather than as one long, smooth progression.',
                practical_application='Linear models suit athletes needing a clear, simple progression (e.g. novices); undulating models suit athletes needing more variety or training multiple qualities concurrently.',
                key_coaching_points='Choose the model based on the athlete\'s training age and the number of qualities being developed at once, not by default habit.',
                common_mistakes='Applying one rigid model to every athlete regardless of their needs or experience level.',
                safety_considerations='None specific — both are legitimate, well-established planning approaches.',
                summary='Linear periodization progresses smoothly over a block; undulating periodization varies more frequently — both are valid depending on the athlete and goal.',
                references='General periodization models literature used in strength & conditioning coach education.',
                faqs=[],
                quiz=dict(
                    title='Periodization Basics Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='What is the largest periodization timeframe, often a full season?',
                            explanation='The macrocycle is the largest timeframe, broken down into mesocycles and microcycles.',
                            choices=[('Microcycle', False), ('Mesocycle', False), ('Macrocycle', True)],
                        ),
                        dict(
                            question_text='A microcycle typically corresponds to what length of time?',
                            explanation='A microcycle is typically a single training week.',
                            choices=[('A single training week', True), ('A full year', False), ('A single session', False)],
                        ),
                        dict(
                            question_text='Which periodization model varies volume/intensity more frequently, sometimes within the same week?',
                            explanation='Undulating periodization varies training variables more frequently than the smoother linear model.',
                            choices=[('Linear periodization', False), ('Undulating periodization', True), ('Neither varies at all', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_football_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='football')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Football: Physical Demands',
            subtitle='What the sport actually asks of an athlete\'s body',
            description='An introduction to the movement and energy-system demands of football (soccer), as a foundation for planning training.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)

        lessons = [
            dict(
                title='Movement and Energy System Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the mixed physical demands football places on players.',
                content='Football combines long periods of low-to-moderate activity with repeated short, high-intensity efforts.',
                scientific_explanation=(
                    'Players cover large total distances over a match at low-to-moderate intensity (walking, jogging), '
                    'interspersed with repeated short sprints, accelerations, decelerations, jumps, and changes of '
                    'direction. This mixed profile means both aerobic endurance (to sustain the overall workload) '
                    'and anaerobic power/speed qualities (for the high-intensity actions) matter.'
                ),
                practical_application='Training should develop aerobic base capacity alongside repeated-sprint ability, acceleration/deceleration mechanics, and change-of-direction skill — not just one quality in isolation.',
                key_coaching_points='Repeated high-intensity efforts with incomplete recovery are more sport-specific than isolated maximal sprints alone.',
                common_mistakes='Training only steady-state aerobic running and neglecting repeated-sprint and change-of-direction qualities the sport actually demands.',
                safety_considerations='Deceleration and change-of-direction actions place high load on the lower limbs — technique in these should be coached deliberately, not left to chance.',
                summary='Football\'s physical demands are mixed: a large aerobic workload punctuated by frequent short, high-intensity actions — training should reflect both.',
                references='General football (soccer) physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Common Injury Areas in Football',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify commonly stressed areas in football and why.',
                content='Certain injury patterns recur in football due to its specific movement demands.',
                scientific_explanation='The hamstrings are frequently stressed during high-speed running and sudden deceleration; the ankles and knees are stressed during cutting, jumping, and contact situations. Repeated high-speed running and change-of-direction volume are commonly discussed contributing factors.',
                practical_application='Include hamstring strength/eccentric work and controlled change-of-direction technique training as a routine part of a football conditioning program, not just after an injury has occurred.',
                key_coaching_points='Build tolerance to deceleration and change-of-direction demands progressively across a preseason rather than introducing them abruptly.',
                common_mistakes='Only addressing hamstring or ankle/knee conditioning reactively, after an injury, rather than proactively.',
                safety_considerations='Any hamstring tightness or pain during high-speed running should be addressed before continuing high-speed work.',
                summary='Football\'s demands make the hamstrings, ankles, and knees common injury areas — proactive, progressive conditioning for these areas is standard practice, not just post-injury rehab.',
                references='General football injury-epidemiology principles used in sport-specific conditioning practice.',
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
