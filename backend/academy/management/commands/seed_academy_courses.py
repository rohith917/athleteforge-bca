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
            ('speed-development-fundamentals', self._seed_speed_course),
            ('sports-psychology-fundamentals', self._seed_psychology_course),
            ('sports-nutrition-fundamentals', self._seed_nutrition_course),
            ('plyometrics-fundamentals', self._seed_plyometrics_course),
            ('taekwondo-physical-demands', self._seed_taekwondo_physical_demands_course),
            ('mobility-flexibility-fundamentals', self._seed_mobility_course),
            ('program-design-fundamentals', self._seed_program_design_course),
            ('anti-doping-education-basics', self._seed_anti_doping_course),
            ('swimming-physical-demands', self._seed_swimming_physical_demands_course),
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

    def _seed_speed_course(self, author):
        category = CourseCategory.objects.get(slug='speed-development', sport=None)
        course = Course.objects.create(
            title='Speed Development Fundamentals',
            subtitle='The building blocks of running faster: acceleration, max velocity, and mechanics',
            description='Introduces the phases of a sprint and the core technical elements coaches look for when developing speed.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Speed Fundamentals', order=1)

        lessons = [
            dict(
                title='The Phases of a Sprint',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Distinguish acceleration from max-velocity sprinting.',
                content='A sprint is not one uniform effort — it moves through distinct phases with different mechanical demands.',
                scientific_explanation=(
                    'Acceleration (roughly the first 10-30m for most athletes) is characterized by a forward '
                    'body lean and longer ground contact times as the athlete builds speed from a stop. Max '
                    'velocity sprinting involves a more upright posture, shorter ground contact times, and '
                    'different muscular demands than acceleration.'
                ),
                practical_application='Train both phases deliberately — short acceleration-focused sprints (e.g. 10-20m) and separate longer efforts that allow the athlete to reach top speed.',
                key_coaching_points='Match sprint distance to the phase being trained — very short reps rarely reach max velocity.',
                common_mistakes='Only ever training one phase (e.g. always short accelerations) when the sport requires both qualities.',
                safety_considerations='Maximal sprinting is high-stress on the hamstrings; ensure adequate warm-up and progressive exposure before maximal-effort sprints.',
                summary='Acceleration and max-velocity sprinting are mechanically distinct phases and both deserve dedicated training attention.',
                references='General sprint mechanics principles used in speed-development coaching.',
                faqs=[],
            ),
            dict(
                title='Sprint Technique Basics',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Identify the basic technical checkpoints coaches use when assessing sprint technique.',
                content='A handful of simple checkpoints can guide sprint technique coaching without overcomplicating it.',
                scientific_explanation='Efficient sprinting generally involves full hip extension behind the body, a relatively tall posture during max velocity, arm action that mirrors leg action, and minimal excess tension in the upper body (shoulders, face, hands).',
                practical_application='Cue simple, observable checkpoints: "drive the arms," "stay tall," "relax the face and hands" rather than overloading an athlete with too many technical cues at once.',
                key_coaching_points='One or two cues per session is usually more effective than a long technical checklist.',
                common_mistakes='Overcoaching technique to the point an athlete becomes tense and mechanical rather than fluid.',
                safety_considerations='Fatigue degrades technique — stop quality sprint work once form clearly breaks down rather than continuing to accumulate reps.',
                summary='A few clear, simple technical cues are usually more effective for developing sprint technique than an exhaustive checklist.',
                references='General sprint-technique coaching principles.',
                faqs=[
                    ('How many quality sprint reps should a session include?', 'It varies by athlete and training age, but quality (full recovery, good technique) generally matters more than accumulating a large number of reps.'),
                ],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_psychology_course(self, author):
        category = CourseCategory.objects.get(slug='sports-psychology', sport=None)
        course = Course.objects.create(
            title='Sports Psychology Fundamentals',
            subtitle='The mental side of training and competing',
            description='Introduces goal setting, pre-competition routines, and basic strategies for managing competitive pressure.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Mental Skills Basics', order=1)

        lessons = [
            dict(
                title='Goal Setting for Athletes',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Distinguish outcome goals from process goals.',
                content='Not all goals are equally useful for driving day-to-day training behavior.',
                scientific_explanation='Outcome goals (e.g. "win the tournament") depend partly on factors outside the athlete\'s control, like opponents. Process goals (e.g. "execute my warm-up routine consistently," "hit my technical cues") are fully within the athlete\'s control and more directly guide daily behavior.',
                practical_application='Set a clear outcome goal for direction, but build the actual training plan around specific, controllable process goals.',
                key_coaching_points='Ask athletes "what can you control today that moves you toward that goal?" rather than only discussing the outcome.',
                common_mistakes='Fixating entirely on outcome goals (e.g. rankings, results) without any controllable process goals underneath them.',
                safety_considerations='None specific.',
                summary='Process goals — things fully within an athlete\'s control — are what actually drive consistent day-to-day improvement toward a larger outcome goal.',
                references='General goal-setting principles used in sports psychology practice.',
                faqs=[],
            ),
            dict(
                title='Pre-Competition Routines',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Explain the purpose of a consistent pre-competition routine.',
                content='A pre-competition routine is a consistent sequence of actions an athlete follows before performing.',
                scientific_explanation='A familiar, well-rehearsed routine gives the athlete something predictable to focus on under pressure, which can reduce competitive anxiety and help attention settle on the task rather than on uncontrollable outcome concerns.',
                practical_application='Build a simple, repeatable routine (physical warm-up + a few mental cues) that the athlete practices in training, not just introduces on competition day.',
                key_coaching_points='Rehearse the routine in training so it is familiar, not something new attempted for the first time under competition pressure.',
                common_mistakes='Only using a special routine on competition day, so it feels unfamiliar exactly when it matters most.',
                safety_considerations='None specific.',
                summary='A well-rehearsed pre-competition routine gives athletes a controllable, familiar focus under pressure.',
                references='General pre-performance-routine principles used in sports psychology practice.',
                faqs=[],
                quiz=dict(
                    title='Sports Psychology Basics Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='Which type of goal is fully within an athlete\'s control?',
                            explanation='Process goals (e.g. executing a routine, hitting technical cues) are controllable; outcome goals depend partly on external factors.',
                            choices=[('Outcome goals', False), ('Process goals', True), ('Neither type is controllable', False)],
                        ),
                        dict(
                            question_text='Why should a pre-competition routine be rehearsed in training, not just used on competition day?',
                            explanation='Rehearsal makes the routine familiar, so it can genuinely help focus under pressure rather than feeling unfamiliar exactly when it matters.',
                            choices=[
                                ('So it becomes familiar and can help focus under pressure', True),
                                ('It has no real effect either way', False),
                                ('Because rules require it', False),
                            ],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_nutrition_course(self, author):
        category = CourseCategory.objects.get(slug='sports-nutrition', sport=None)
        course = Course.objects.create(
            title='Sports Nutrition Fundamentals',
            subtitle='The basics of fueling training and recovery',
            description='Introduces macronutrient roles for athletes and practical fueling/timing basics around training.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Nutrition Basics', order=1)

        lessons = [
            dict(
                title='Macronutrients and Their Roles',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the general role of carbohydrate, protein, and fat for athletes.',
                content='The three macronutrients each play a different primary role in supporting training and recovery.',
                scientific_explanation='Carbohydrate is the body\'s primary fuel source for moderate-to-high intensity exercise, stored as glycogen in muscle and liver. Protein supplies the amino acids needed for muscle repair and adaptation after training. Fat supports longer-duration, lower-intensity energy needs and various hormonal functions.',
                practical_application='Athletes in heavy training generally need adequate carbohydrate to fuel sessions and adequate protein spread across the day to support recovery, alongside sufficient overall energy intake.',
                key_coaching_points='Under-fueling (too little total energy intake) undermines both performance and recovery regardless of how the diet is otherwise balanced.',
                common_mistakes='Cutting carbohydrate sharply during heavy training blocks, which can impair training quality and recovery.',
                safety_considerations='Significant, prolonged under-eating in young athletes is a genuine health concern and warrants involving a qualified nutrition professional.',
                summary='Carbohydrate fuels training, protein supports repair, and fat supports longer-duration energy needs — all three matter for an athlete\'s overall intake.',
                references='General sports nutrition macronutrient principles.',
                faqs=[],
            ),
            dict(
                title='Fueling Around Training',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Explain basic principles for eating before and after training sessions.',
                content='What and when an athlete eats around a session can affect both performance in that session and recovery afterward.',
                scientific_explanation='Eating a carbohydrate-containing meal or snack a few hours before intense training helps ensure adequate fuel is available. After training, consuming protein and carbohydrate supports glycogen replenishment and the muscle repair process that follows exercise-induced fatigue.',
                practical_application='A simple approach: a balanced meal 2-3 hours pre-session (or a lighter snack closer to start time), and a combined protein + carbohydrate meal or snack within a couple of hours post-session.',
                key_coaching_points='Consistency of overall daily intake matters more than precise timing for most athletes — timing is a refinement, not a substitute for adequate daily nutrition.',
                common_mistakes='Training in a fasted state before high-intensity sessions without a specific reason to do so, or skipping post-training food entirely.',
                safety_considerations='Athletes with any diagnosed medical or disordered-eating condition should follow guidance from a qualified professional, not general coaching advice.',
                summary='Basic pre- and post-session fueling supports both performance and recovery — but consistent overall daily nutrition matters most.',
                references='General sports nutrition timing principles.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_plyometrics_course(self, author):
        category = CourseCategory.objects.get(slug='plyometrics', sport=None)
        course = Course.objects.create(
            title='Plyometrics Fundamentals',
            subtitle='Training the stretch-shortening cycle safely and progressively',
            description='Introduces what plyometric training is, the stretch-shortening cycle, and how to progress it safely.',
            category=category, level='intermediate', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Plyometrics Basics', order=1)

        lessons = [
            dict(
                title='What Is Plyometric Training?',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Explain the stretch-shortening cycle in plain terms.',
                content='Plyometric exercises use a rapid stretch of a muscle immediately followed by a rapid contraction.',
                scientific_explanation=(
                    'When a muscle-tendon unit is rapidly stretched (the eccentric phase) and immediately '
                    'followed by a fast contraction (the concentric phase) — as in a jump landing followed '
                    'immediately by another jump — elastic energy stored during the stretch contributes to the '
                    'following contraction, producing more force than a concentric contraction alone. This is '
                    'the stretch-shortening cycle.'
                ),
                practical_application='Common examples include hops, bounds, and jump-and-land-and-jump-again drills.',
                key_coaching_points='The speed of the transition between the stretch and the contraction (minimal ground contact time) is what makes an exercise genuinely plyometric, not just "any jump."',
                common_mistakes='Treating slow, controlled jump-and-stick drills the same as fast, reactive plyometric drills — they train different qualities.',
                safety_considerations='Plyometrics load tendons and joints significantly; they require an athlete to already have adequate strength and landing mechanics as a foundation.',
                summary='Plyometric training uses the stretch-shortening cycle — a fast stretch immediately followed by a fast contraction — to develop reactive power.',
                references='General stretch-shortening-cycle and plyometric-training principles.',
                faqs=[],
            ),
            dict(
                title='Progressing Plyometrics Safely',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe a basic, safe progression model for introducing plyometric training.',
                content='Plyometric training should be introduced and progressed gradually, not started at high intensity.',
                scientific_explanation='Because plyometrics place high, rapid loads on tendons and connective tissue, tissue needs time to adapt. A common approach progresses from low-intensity, double-leg, in-place exercises toward higher-intensity, single-leg, and traveling variations only as the athlete demonstrates control at each level.',
                practical_application='Start with basics like double-leg pogo hops or box step-downs before progressing to bounds, single-leg hops, or depth jumps.',
                key_coaching_points='Landing quality (quiet, controlled landings) is the main signal for whether an athlete is ready to progress to a harder variation.',
                common_mistakes='Jumping straight to high-intensity plyometrics (e.g. depth jumps) without a strength and landing-mechanics foundation first.',
                safety_considerations='Young or novice athletes and anyone returning from a lower-limb injury need a longer, more gradual introduction before higher-intensity plyometric work.',
                summary='Progress plyometrics gradually — from low-intensity, controlled variations toward higher-intensity ones — using landing quality as the main readiness signal.',
                references='General plyometric-progression principles used in strength & conditioning practice.',
                faqs=[],
                quiz=dict(
                    title='Plyometrics Fundamentals Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='What is the "stretch-shortening cycle"?',
                            explanation='A rapid stretch (eccentric) immediately followed by a rapid contraction (concentric), using stored elastic energy.',
                            choices=[
                                ('A slow, controlled stretch held for 30 seconds', False),
                                ('A rapid stretch immediately followed by a rapid contraction', True),
                                ('A type of static strength exercise', False),
                            ],
                        ),
                        dict(
                            question_text='What is the main signal that an athlete is ready to progress to a harder plyometric variation?',
                            explanation='Landing quality — quiet, controlled landings — is the key readiness signal before progressing.',
                            choices=[('How much they enjoyed it', False), ('Landing quality and control', True), ('How many reps they completed', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_taekwondo_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='taekwondo')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Taekwondo: Physical Demands',
            subtitle='What competitive Taekwondo asks of an athlete\'s body',
            description='An introduction to the movement and energy-system demands of Olympic-style Taekwondo sparring.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)

        lessons = [
            dict(
                title='Movement and Energy System Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the physical qualities competitive Taekwondo sparring demands.',
                content='Olympic-style Taekwondo sparring involves short, explosive kicking exchanges separated by brief pauses, across multiple rounds.',
                scientific_explanation=(
                    'Matches consist of repeated short, high-intensity bursts (kicking exchanges, footwork) with '
                    'brief recovery periods between them, across multiple rounds — placing demand on both '
                    'explosive power (for scoring kicks) and the ability to repeat high-intensity efforts with '
                    'incomplete recovery across a full match.'
                ),
                practical_application='Training should combine leg power development (for kick speed/force) with repeated-effort conditioning that mimics the match\'s work-to-rest pattern, rather than steady-state running alone.',
                key_coaching_points='Match the conditioning work-to-rest ratio to what actually happens in competition rounds.',
                common_mistakes='Relying only on long, steady-state aerobic training when the sport\'s actual demand is repeated short bursts.',
                safety_considerations='The kicking leg and standing/support leg are both under high, repeated load — conditioning and technique work should address both.',
                summary='Taekwondo sparring demands explosive leg power plus the ability to repeat high-intensity bursts with incomplete recovery — training should reflect that specific pattern.',
                references='General combat-sport physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Common Injury Areas in Taekwondo',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify commonly stressed areas in Taekwondo and why.',
                content='Taekwondo\'s kicking-based, single-leg-support movement pattern creates some recurring injury patterns.',
                scientific_explanation='The standing (support) leg experiences high single-leg loading during kicks, stressing the ankle and knee. The kicking leg\'s hip flexors and groin are repeatedly worked through large ranges of motion at speed. Head contact risk also exists in sparring exchanges.',
                practical_application='Include single-leg strength and balance work, hip mobility work, and appropriate protective equipment/rule adherence as standard parts of training.',
                key_coaching_points='Balance and single-leg stability training directly supports the support-leg demands of kicking.',
                common_mistakes='Training kicking technique and power extensively while neglecting single-leg strength/balance and hip mobility work that supports it.',
                safety_considerations='Any groin, hip flexor, or ankle pain during kicking drills should be assessed before continuing high-volume kicking work.',
                summary='The support leg (ankle/knee) and kicking leg\'s hip/groin region are common Taekwondo injury areas — targeted strength, balance, and mobility work help address both.',
                references='General combat-sport injury-epidemiology principles used in sport-specific conditioning practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_mobility_course(self, author):
        category = CourseCategory.objects.get(slug='mobility', sport=None)
        course = Course.objects.create(
            title='Mobility & Flexibility Fundamentals',
            subtitle='The difference between the two, and how to train each',
            description='Clarifies what mobility and flexibility actually mean, and introduces basic ways to train both.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Mobility & Flexibility Basics', order=1)

        lessons = [
            dict(
                title='Mobility vs Flexibility: What\'s the Difference?',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Distinguish mobility from flexibility as distinct but related qualities.',
                content='These terms are often used interchangeably, but they describe different things.',
                scientific_explanation='Flexibility refers to a muscle\'s passive ability to lengthen (e.g. how far a limb can be moved by an external force). Mobility refers to how much usable, controlled range of motion a joint has under an athlete\'s own active control — it involves not just tissue length but also strength and motor control through that range.',
                practical_application='An athlete can be flexible in a passive stretch test but still lack mobility if they can\'t actively control that range during movement — both may need training depending on the gap.',
                key_coaching_points='Assess both passive range (flexibility) and active, controlled range (mobility) rather than assuming one implies the other.',
                common_mistakes='Assuming a flexible athlete automatically has good functional mobility, or vice versa.',
                safety_considerations='Excessive passive flexibility without adequate strength/control through that range (hypermobility) can itself be an injury risk factor.',
                summary='Flexibility is passive range of motion; mobility is usable, controlled range under an athlete\'s own strength — both matter, and they are not the same thing.',
                references='General mobility/flexibility terminology used in strength & conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Basic Mobility Training Approaches',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe simple ways to train mobility for a given joint.',
                content='Mobility training generally combines moving through a range with some element of control or loading through that range.',
                scientific_explanation='Simply stretching passively develops flexibility but not necessarily control through that range. Actively moving a joint through its range under some load or control (e.g. controlled articular rotations, loaded stretching) trains the nervous system to actually use the available range, which is what "mobility" specifically refers to.',
                practical_application='Combine passive stretching (to build available range) with active, controlled movement through that range (to make it usable) rather than relying on passive stretching alone.',
                key_coaching_points='Prioritize mobility work for joints and ranges the athlete\'s sport actually uses — mobility training should be somewhat targeted, not generic.',
                common_mistakes='Only doing passive stretching and assuming that alone builds usable mobility.',
                safety_considerations='Introduce new ranges of motion gradually, especially under load — don\'t jump straight to loaded work in a brand-new range.',
                summary='Combining passive range-building with active, controlled movement through that range is what actually develops usable mobility, not passive stretching alone.',
                references='General mobility-training principles used in strength & conditioning practice.',
                faqs=[],
                quiz=dict(
                    title='Mobility & Flexibility Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='Which term describes a joint\'s usable range of motion under the athlete\'s own active control?',
                            explanation='Mobility specifically refers to controlled, active range of motion — not just passive tissue length.',
                            choices=[('Flexibility', False), ('Mobility', True), ('Endurance', False)],
                        ),
                        dict(
                            question_text='What does passive stretching alone tend to build?',
                            explanation='Passive stretching builds passive range (flexibility) but not necessarily the active control needed to use that range.',
                            choices=[('Usable, controlled mobility', False), ('Passive range of motion (flexibility)', True), ('Maximal strength', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_program_design_course(self, author):
        category = CourseCategory.objects.get(slug='program-design', sport=None)
        course = Course.objects.create(
            title='Program Design Fundamentals',
            subtitle='How to structure a training session and a training week',
            description='Introduces basic principles for sequencing exercises within a session and structuring a training week.',
            category=category, level='intermediate', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Program Design Basics', order=1)

        lessons = [
            dict(
                title='Sequencing a Training Session',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain a sensible default order for organizing exercises within a session.',
                content='The order exercises appear in a session affects how well an athlete can perform each one.',
                scientific_explanation='Qualities requiring the highest skill and speed (technical work, plyometrics, sprint work) are generally placed early in a session, while the nervous system is freshest. Heavy strength work typically follows. Lower-skill, more fatigue-tolerant work (accessory exercises, aerobic conditioning) is usually placed later, since accumulated fatigue affects it less.',
                practical_application='A common session order: warm-up -> speed/power/technical work -> primary strength work -> accessory work -> conditioning -> cool-down.',
                key_coaching_points='Put the exercises that most need precision and freshness first, and the most fatigue-tolerant work last.',
                common_mistakes='Placing high-skill, high-speed work (like plyometrics or technical sprint drills) at the end of a session after the athlete is already fatigued.',
                safety_considerations='Technical/high-speed work performed under significant fatigue carries higher injury risk due to degraded movement quality.',
                summary='Order a session from highest-skill/freshest-nervous-system work toward more fatigue-tolerant work, not arbitrarily.',
                references='General session-sequencing principles used in strength & conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Structuring a Training Week',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Describe basic principles for spacing different training qualities across a week.',
                content='How sessions are spaced across a week affects how well an athlete can recover and perform in each one.',
                scientific_explanation='Similar or overlapping fatigue types (e.g. two very heavy leg-strength sessions) generally need more recovery time between them than dissimilar types (e.g. a heavy leg day followed by an upper-body-focused day). Spacing high-demand sessions with adequate recovery, rather than stacking them back-to-back, supports better quality in each.',
                practical_application='Sequence the week so the highest-demand, most similar sessions aren\'t placed on consecutive days without adequate recovery between them.',
                key_coaching_points='Map out a week\'s fatigue pattern, not just its exercise content, before finalizing the schedule.',
                common_mistakes='Scheduling by convenience (e.g. "leg day is always Monday and Thursday") without considering whether that spacing actually allows adequate recovery.',
                safety_considerations='Repeatedly stacking similar high-demand sessions without recovery is a load-management risk covered in more depth in Injury Prevention.',
                summary='Space training qualities across the week with recovery in mind, not just convenience — similar high-demand sessions need more space between them.',
                references='General weekly training-structure principles used in strength & conditioning practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_anti_doping_course(self, author):
        category = CourseCategory.objects.get(slug='anti-doping-education', sport=None)
        course = Course.objects.create(
            title='Anti-Doping Education: Basics',
            subtitle='What every athlete should understand about clean sport',
            description='A general introduction to why anti-doping rules exist and the basic responsibilities athletes carry.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Clean Sport Basics', order=1)

        lessons = [
            dict(
                title='Why Anti-Doping Rules Exist',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Explain the basic purpose of anti-doping regulation in sport.',
                content='Anti-doping systems exist to protect fair competition and athlete health.',
                scientific_explanation='Prohibited substances and methods are generally restricted for two overlapping reasons: they can provide an unfair competitive advantage, and many carry real health risks, particularly for developing young athletes. Sports governing bodies maintain and regularly update prohibited lists based on these concerns.',
                practical_application='Athletes and coaches should treat anti-doping compliance as a standard part of training and competition, not an afterthought only relevant to elite athletes.',
                key_coaching_points='Build awareness of anti-doping responsibility into an athlete\'s general education early, not just before major competitions.',
                common_mistakes='Assuming anti-doping rules only matter at the highest competitive levels.',
                safety_considerations='None specific — this lesson is educational context, not medical guidance.',
                summary='Anti-doping rules exist to protect both fair competition and athlete health, and apply at every competitive level, not just elite sport.',
                references='General anti-doping principles as commonly taught in athlete education programs.',
                faqs=[],
            ),
            dict(
                title='Athlete Responsibility Basics',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe basic athlete responsibilities under most anti-doping systems.',
                content='Anti-doping systems generally place direct personal responsibility on the athlete for what enters their body.',
                scientific_explanation='Under a "strict liability" principle common to most anti-doping frameworks, an athlete can be held responsible for a prohibited substance found in their system regardless of how it got there — including through contaminated supplements or medications taken without checking their status first.',
                practical_application='Athletes should check any medication or supplement against their sport\'s current prohibited list (or with a qualified professional) before use, particularly around competition.',
                key_coaching_points='Encourage athletes to ask before taking anything new, rather than assuming a product is safe because it is commercially available.',
                common_mistakes='Assuming over-the-counter supplements are automatically safe under anti-doping rules without checking.',
                safety_considerations='This is general educational content, not medical or legal advice — athletes with specific medication questions should consult their sport\'s official anti-doping body or a qualified professional.',
                summary='Most anti-doping systems place direct responsibility on the athlete for what enters their body — checking before taking anything new is a basic protective habit.',
                references='General "strict liability" principle as commonly explained in athlete anti-doping education.',
                faqs=[
                    ('Does this replace official anti-doping guidance from my sport\'s governing body?', 'No — always follow your sport\'s official anti-doping body for authoritative, current guidance and prohibited lists.'),
                ],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_swimming_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='swimming')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Swimming: Physical Demands',
            subtitle='What competitive swimming asks of an athlete\'s body',
            description='An introduction to the movement and energy-system demands of competitive swimming.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)

        lessons = [
            dict(
                title='Movement and Energy System Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the physical qualities competitive swimming demands.',
                content='Swimming is a whole-body, non-weight-bearing sport with event-dependent energy demands.',
                scientific_explanation=(
                    'Unlike most land sports, swimming is largely non-weight-bearing, which changes the injury '
                    'and conditioning picture, while placing high repetitive demand on the shoulders in '
                    'particular. Energy demands vary substantially by event distance — sprint events rely more '
                    'on anaerobic power, while distance events rely more on aerobic endurance — so training '
                    'demands differ meaningfully across events.'
                ),
                practical_application='Training should be matched to the athlete\'s competitive event distance — sprint-focused athletes and distance-focused athletes have meaningfully different conditioning priorities.',
                key_coaching_points='Don\'t apply one generic "swimmer conditioning" template regardless of event specialization.',
                common_mistakes='Training all swimmers with the same energy-system emphasis regardless of their actual competitive events.',
                safety_considerations='The shoulder\'s repetitive overhead-style loading in swimming makes shoulder-health maintenance work a standard, not optional, part of training.',
                summary='Swimming is non-weight-bearing with high repetitive shoulder demand, and its energy-system demands vary significantly by event distance.',
                references='General competitive-swimming physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Common Injury Areas in Swimming',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify commonly stressed areas in competitive swimming and why.',
                content='Swimming\'s repetitive overhead stroke pattern creates a recognizable injury profile.',
                scientific_explanation='"Swimmer\'s shoulder" — a broad term for shoulder pain linked to the very high repetition count of overhead stroke movements — is one of the most commonly discussed issues in competitive swimmers. Knee stress (particularly in breaststroke) and lower back stress (particularly in butterfly and starts/turns) are also commonly noted.',
                practical_application='Include shoulder-stability and rotator-cuff/scapular strength work as a routine part of a swimmer\'s dryland training, alongside stroke-specific technique attention.',
                key_coaching_points='Address shoulder-health maintenance proactively and continuously, not only after pain appears.',
                common_mistakes='Treating dryland strength work as optional or secondary to pool volume.',
                safety_considerations='Persistent shoulder pain during or after swimming warrants assessment rather than simply reducing volume temporarily and hoping it resolves.',
                summary='The shoulder (from repetitive overhead stroke volume) is the standout injury area in swimming, with knee and lower-back stress also common depending on stroke — proactive dryland work helps address this.',
                references='General competitive-swimming injury-epidemiology principles used in sport-specific conditioning practice.',
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
