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
            ('competition-preparation-fundamentals', self._seed_competition_prep_course),
            ('coach-education-fundamentals', self._seed_coach_education_course),
            ('leadership-communication-fundamentals', self._seed_leadership_course),
            ('functional-training-fundamentals', self._seed_functional_training_course),
            ('basketball-physical-demands', self._seed_basketball_physical_demands_course),
            ('human-anatomy-for-athletes-fundamentals', self._seed_anatomy_course),
            ('exercise-physiology-fundamentals', self._seed_physiology_course),
            ('sports-biomechanics-fundamentals', self._seed_biomechanics_course),
            ('hydration-fundamentals', self._seed_hydration_course),
            ('cricket-physical-demands', self._seed_cricket_physical_demands_course),
            ('sports-science-foundations-101', self._seed_sports_science_foundations_course),
            ('sleep-optimization-fundamentals', self._seed_sleep_course),
            ('movement-screening-fundamentals', self._seed_movement_screening_course),
            ('stretching-fundamentals', self._seed_stretching_course),
            ('volleyball-physical-demands', self._seed_volleyball_physical_demands_course),
            ('return-to-sport-fundamentals', self._seed_return_to_sport_course),
            ('performance-testing-assessment-fundamentals', self._seed_performance_testing_course),
            ('monitoring-training-load-fundamentals', self._seed_monitoring_load_course),
            ('agility-fundamentals', self._seed_agility_course),
            ('boxing-physical-demands', self._seed_boxing_physical_demands_course),
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

    def _seed_competition_prep_course(self, author):
        category = CourseCategory.objects.get(slug='competition-preparation', sport=None)
        course = Course.objects.create(
            title='Competition Preparation Fundamentals',
            subtitle='Tapering, routines, and managing the days before competing',
            description='Introduces the taper period, pre-competition routines, and simple day-before/day-of preparation principles.',
            category=category, level='intermediate', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Preparing to Compete', order=1)

        lessons = [
            dict(
                title='The Taper: Reducing Load Before Competition',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain what a taper is and why training volume is reduced before competition.',
                content='A taper is a planned reduction in training volume in the days/weeks before a competition, while keeping some intensity.',
                scientific_explanation='Accumulated training fatigue can mask an athlete\'s true fitness. Reducing volume while maintaining some high-intensity work allows fatigue to dissipate while fitness adaptations are retained, so the athlete competes closer to their real capability rather than in a fatigued state.',
                practical_application='Reduce overall training volume (fewer sets/reps or shorter sessions) in the final 1-2 weeks before a key competition, while keeping some short, sharp, high-intensity work to stay primed.',
                key_coaching_points='Cut volume, not all intensity — a taper that removes everything can leave an athlete feeling flat.',
                common_mistakes='Continuing full training volume right up to competition day, or tapering so much the athlete loses their edge.',
                safety_considerations='None specific — this is a load-management strategy, not a safety intervention.',
                summary='A taper reduces training volume before competition so accumulated fatigue fades while fitness is retained.',
                references='General tapering principles used in competition-preparation coaching.',
                faqs=[],
            ),
            dict(
                title='Pre-Competition Routines and Day-Of Preparation',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Describe simple, practical day-before and day-of competition preparation steps.',
                content='Simple, consistent routines around competition day reduce uncertainty and support performance.',
                scientific_explanation='Familiar routines (as covered in Sports Psychology Fundamentals) reduce competitive anxiety by giving the athlete something predictable to focus on. Physically, adequate sleep and normal, familiar meals in the day before competition support having the athlete arrive rested and fueled, rather than experimenting with anything new.',
                practical_application='Plan travel, sleep, and meal timing in advance; rehearse the competition-day warm-up in training beforehand so nothing on the day is unfamiliar.',
                key_coaching_points='Never try a new routine, meal, or piece of equipment for the first time on competition day.',
                common_mistakes='Trying new food, equipment, or warm-up routines for the first time right before competing.',
                safety_considerations='None specific.',
                summary='Familiar, well-rehearsed routines around sleep, food, travel, and warm-up reduce uncertainty and support performing at one\'s actual capability on competition day.',
                references='General competition-preparation and pre-performance-routine principles.',
                faqs=[
                    ('Should athletes change anything about their training in the final 48 hours?', 'Generally no — the final 1-2 days should be familiar and light, not a time to introduce anything new.'),
                ],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_coach_education_course(self, author):
        category = CourseCategory.objects.get(slug='coach-education', sport=None)
        course = Course.objects.create(
            title='Coach Education Fundamentals',
            subtitle='Core principles of effective, athlete-centered coaching',
            description='Introduces athlete-centered coaching, effective feedback, and building a positive training environment.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Coaching Basics', order=1)

        lessons = [
            dict(
                title='Athlete-Centered Coaching',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain what it means to coach in an athlete-centered way.',
                content='Athlete-centered coaching adapts the approach to the individual athlete rather than applying one fixed method to everyone.',
                scientific_explanation='Athletes vary in training age, learning style, motivation, and life circumstances. Coaching that considers these differences — while still holding clear standards — tends to build more durable engagement and technical understanding than a one-size-fits-all approach.',
                practical_application='Get to know each athlete\'s goals and circumstances; adjust communication style and session design accordingly, without lowering standards.',
                key_coaching_points='Athlete-centered does not mean permissive — it means adapting the approach while keeping expectations clear.',
                common_mistakes='Assuming what worked for one athlete will automatically work identically for every athlete.',
                safety_considerations='None specific.',
                summary='Athlete-centered coaching adapts communication and approach to the individual while maintaining clear, consistent standards.',
                references='General coaching-philosophy principles used in coach education.',
                faqs=[],
            ),
            dict(
                title='Giving Effective Feedback',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Describe characteristics of feedback that actually helps athletes improve.',
                content='Not all feedback is equally useful — how and when it\'s given matters.',
                scientific_explanation='Feedback that is specific, timely, and focused on one or two key points is generally easier for an athlete to act on than vague or overwhelming feedback covering everything at once. Positive framing ("do this") is often easier to execute under pressure than purely negative framing ("don\'t do that").',
                practical_application='Give feedback close to when the action happened, focus on one or two specific, actionable points, and frame cues in terms of what to do rather than only what to avoid.',
                key_coaching_points='One or two clear cues beat five simultaneous corrections.',
                common_mistakes='Piling on many corrections at once, or giving feedback so long after the action that the athlete has lost the context.',
                safety_considerations='None specific.',
                summary='Specific, timely, positively-framed feedback focused on one or two points is generally more actionable than vague or overloaded feedback.',
                references='General coaching-feedback principles used in coach education.',
                faqs=[],
                quiz=dict(
                    title='Coach Education Basics Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='What does "athlete-centered coaching" mean?',
                            explanation='It means adapting the approach to the individual athlete, not lowering standards.',
                            choices=[
                                ('Letting athletes do whatever they want', False),
                                ('Adapting the approach to the individual while keeping clear standards', True),
                                ('Using the exact same method for every athlete', False),
                            ],
                        ),
                        dict(
                            question_text='What generally makes feedback easier for an athlete to act on?',
                            explanation='Specific, timely feedback focused on one or two points is easier to act on than vague or overloaded feedback.',
                            choices=[
                                ('Giving as many corrections as possible at once', False),
                                ('Specific, timely feedback on one or two key points', True),
                                ('Waiting until much later to mention anything', False),
                            ],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_leadership_course(self, author):
        category = CourseCategory.objects.get(slug='leadership-communication', sport=None)
        course = Course.objects.create(
            title='Leadership & Communication Fundamentals',
            subtitle='Building trust and communicating clearly with athletes and teams',
            description='Introduces basic leadership and communication principles relevant to coaching a team or individual athletes.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Leadership Basics', order=1)

        lessons = [
            dict(
                title='Building Trust with Athletes',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Identify basic behaviors that build or erode trust between a coach and athletes.',
                content='Trust is built through consistency between what a coach says and does, over time.',
                scientific_explanation='Consistency (following through on what is said), fairness (applying standards evenly), and genuine care for athletes as people beyond their performance are commonly cited foundations of coach-athlete trust in sports psychology and leadership literature.',
                practical_application='Follow through on commitments made to athletes, apply rules and standards consistently across the group, and show interest in athletes beyond just their performance metrics.',
                key_coaching_points='Consistency over time matters more than any single gesture.',
                common_mistakes='Applying rules or consequences inconsistently between different athletes.',
                safety_considerations='None specific.',
                summary='Trust is built through consistent follow-through, fairness, and genuine care shown over time, not through any single action.',
                references='General coach-athlete relationship and leadership principles.',
                faqs=[],
            ),
            dict(
                title='Clear Communication with a Group',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe basics of communicating clearly to a group of athletes.',
                content='Communicating to a team differs somewhat from one-on-one feedback — clarity and consistency matter even more.',
                scientific_explanation='In group settings, instructions are easily lost or misinterpreted if not concise and confirmed. Checking understanding (e.g. asking an athlete to repeat back a key instruction) and using consistent terminology session to session reduces confusion.',
                practical_application='Keep group instructions short and concrete; use the same terms for the same drills/concepts every session rather than varying language.',
                key_coaching_points='Consistent terminology across sessions reduces confusion more than any single well-worded instruction.',
                common_mistakes='Using different terms for the same drill or concept across different sessions.',
                safety_considerations='None specific.',
                summary='Clear, concise, and consistent terminology reduces confusion when communicating with a group.',
                references='General team-communication principles used in coach education.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_functional_training_course(self, author):
        category = CourseCategory.objects.get(slug='functional-training', sport=None)
        course = Course.objects.create(
            title='Functional Training Fundamentals',
            subtitle='Training movement patterns that transfer to real activity',
            description='Introduces the idea of functional training and how to select exercises that transfer to an athlete\'s sport or daily movement.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Functional Training Basics', order=1)

        lessons = [
            dict(
                title='What Makes Training "Functional"?',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Explain the core idea behind functional training.',
                content='"Functional" training emphasizes movement patterns and qualities that transfer to real activities, rather than training a muscle in isolation for its own sake.',
                scientific_explanation='Many real-world and sporting movements involve multiple joints and muscle groups working together (e.g. a squat pattern, a rotational throw), often while also requiring balance and core stability. Training that reflects these multi-joint, whole-body patterns is more likely to transfer to actual performance than training that only isolates single muscles.',
                practical_application='Favor multi-joint, whole-body movement patterns (squat, hinge, push, pull, carry, rotate) as the foundation, using isolation exercises to address specific weaknesses rather than as the main focus.',
                key_coaching_points='Ask "does this movement pattern resemble something the athlete actually needs to do?" when selecting exercises.',
                common_mistakes='Building a program entirely from isolation exercises with no whole-body movement patterns.',
                safety_considerations='Multi-joint movements require good technique — prioritize movement quality before adding significant load.',
                summary='Functional training emphasizes multi-joint, whole-body movement patterns that transfer to real activity, rather than isolated single-muscle work as the main focus.',
                references='General functional-training principles used in strength & conditioning practice.',
                faqs=[],
            ),
            dict(
                title='The Fundamental Movement Patterns',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='List the commonly-referenced fundamental movement patterns used to organize functional training.',
                content='Most functional training programs can be organized around a small set of fundamental movement patterns.',
                scientific_explanation='A commonly used organizing framework includes: squat, hinge (e.g. deadlift pattern), push (horizontal/vertical), pull (horizontal/vertical), carry (loaded walking), and rotate/anti-rotate (core control against rotational force). Covering all of these across a training week helps ensure balanced development rather than overemphasizing one pattern.',
                practical_application='Check a training week against these categories — if pull or rotational/anti-rotational work is consistently missing, the program has a gap worth addressing.',
                key_coaching_points='Use the movement-pattern checklist as a program-design sanity check, not a rigid rule.',
                common_mistakes='Overemphasizing push and squat patterns while neglecting pull and rotational/anti-rotational work.',
                safety_considerations='An imbalance favoring pushing over pulling movements is a commonly cited contributor to shoulder posture and injury issues over time.',
                summary='Organizing training around squat, hinge, push, pull, carry, and rotate/anti-rotate patterns helps ensure balanced, well-rounded development.',
                references='General fundamental-movement-pattern frameworks used in strength & conditioning practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_basketball_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='basketball')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Basketball: Physical Demands',
            subtitle='What competitive basketball asks of an athlete\'s body',
            description='An introduction to the movement and energy-system demands of competitive basketball.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)

        lessons = [
            dict(
                title='Movement and Energy System Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the physical qualities competitive basketball demands.',
                content='Basketball combines frequent jumping, sprinting, and rapid changes of direction across a physically demanding game.',
                scientific_explanation=(
                    'Players perform repeated jumps (rebounding, shooting contests), short sprints, and frequent '
                    'changes of direction, interspersed with brief recovery moments, across four quarters. This '
                    'profile demands lower-body power (for jumping), repeated-sprint ability, and change-of-'
                    'direction quality, layered on a substantial aerobic base to sustain the whole game.'
                ),
                practical_application='Combine jump-training (plyometrics), repeated-sprint conditioning, and change-of-direction technique work, on top of a solid aerobic base — not just isolated vertical-jump training.',
                key_coaching_points='Landing mechanics after jumps deserve as much coaching attention as the jump itself.',
                common_mistakes='Focusing training heavily on vertical jump height while neglecting landing mechanics and change-of-direction quality.',
                safety_considerations='Repeated jumping and landing places high load on the knees and ankles — landing technique coaching is a genuine injury-prevention measure, not just a performance one.',
                summary='Basketball demands lower-body power, repeated-sprint ability, and change-of-direction quality on top of an aerobic base — training should reflect all of these, including landing mechanics.',
                references='General basketball physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Common Injury Areas in Basketball',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify commonly stressed areas in basketball and why.',
                content='Basketball\'s jumping- and cutting-based movement pattern creates a recognizable injury profile.',
                scientific_explanation='The ankles are frequently stressed from jump-landing and player contact underfoot; the knees are stressed from repeated jumping/landing and cutting; fingers/hands are exposed to contact with the ball and other players. Landing mechanics and lower-limb strength are commonly discussed contributing factors to the knee and ankle patterns specifically.',
                practical_application='Include ankle stability and landing-mechanics work, along with lower-limb strength training, as a standard part of a basketball conditioning program.',
                key_coaching_points='Coach a soft, controlled landing (bent knees, quiet landing) as a default technical standard, not an afterthought.',
                common_mistakes='Treating ankle/knee conditioning as reactive (only after an injury) rather than a proactive, ongoing part of training.',
                safety_considerations='Any persistent ankle or knee pain during jumping/landing activities should be assessed before continuing high-volume jump training.',
                summary='The ankles and knees are common basketball injury areas due to repeated jumping, landing, and cutting — proactive landing-mechanics and strength work help address both.',
                references='General basketball injury-epidemiology principles used in sport-specific conditioning practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_anatomy_course(self, author):
        category = CourseCategory.objects.get(slug='human-anatomy-for-athletes', sport=None)
        course = Course.objects.create(
            title='Human Anatomy for Athletes: Fundamentals',
            subtitle='The basics of muscles, joints, and movement every coach should know',
            description='A plain-language introduction to skeletal muscle basics and major joint types, as a foundation for understanding training and injury.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Anatomy Basics', order=1)

        lessons = [
            dict(
                title='How Skeletal Muscle Produces Movement',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain, in plain terms, how a skeletal muscle causes a joint to move.',
                content='Skeletal muscles attach to bones across joints and create movement by contracting.',
                scientific_explanation='A skeletal muscle typically has an origin (a more fixed attachment point) and an insertion (a point that moves) on either side of a joint. When the muscle contracts, it pulls its insertion toward its origin, causing the joint to move. Most movements involve an "agonist" muscle doing the main work and an "antagonist" on the opposite side relaxing to allow it.',
                practical_application='Understanding a muscle\'s origin/insertion helps predict what movement an exercise trains — e.g. the biceps crossing the elbow explains why it flexes the elbow.',
                key_coaching_points='Relating exercises back to "which joint moves, and which muscle causes it" builds a coach\'s and athlete\'s understanding of technique cues.',
                common_mistakes='Treating anatomy as purely academic rather than connecting it to why a technique cue works.',
                safety_considerations='None specific — this is foundational knowledge.',
                summary='Muscles move joints by contracting and pulling their insertion point toward their origin point, with agonist/antagonist pairs coordinating most movements.',
                references='General human anatomy and kinesiology fundamentals.',
                faqs=[],
            ),
            dict(
                title='Major Joint Types and Their Movement',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Distinguish a few major joint types by the movement they allow.',
                content='Different joint shapes allow different types and amounts of movement.',
                scientific_explanation='Ball-and-socket joints (like the shoulder and hip) allow movement in many directions, including rotation, giving great range but relying heavily on surrounding muscles for stability. Hinge joints (like the knee and elbow) mainly allow bending and straightening in one plane, giving more inherent stability but less range.',
                practical_application='Expect and train more rotational mobility work around ball-and-socket joints (shoulder, hip), and focus more on strength/control through the main bending plane for hinge joints (knee, elbow).',
                key_coaching_points='Match mobility expectations to the joint type — don\'t expect knee rotation the way you\'d expect hip rotation.',
                common_mistakes='Applying the same mobility expectations to every joint regardless of its actual structure.',
                safety_considerations='Forcing a hinge joint (like the knee) into rotational stress it isn\'t designed for is a common injury mechanism.',
                summary='Ball-and-socket joints (shoulder, hip) allow multi-directional movement including rotation; hinge joints (knee, elbow) mainly bend and straighten in one plane — training and mobility expectations should match the joint type.',
                references='General human anatomy and kinesiology fundamentals.',
                faqs=[],
                quiz=dict(
                    title='Anatomy Fundamentals Check',
                    passing_score_percent=70,
                    questions=[
                        dict(
                            question_text='What is the "insertion" of a muscle?',
                            explanation='The insertion is the attachment point that moves when the muscle contracts, pulled toward the origin.',
                            choices=[('The fixed attachment point', False), ('The attachment point that moves when the muscle contracts', True), ('The middle of the muscle belly', False)],
                        ),
                        dict(
                            question_text='Which joint type allows movement in many directions, including rotation?',
                            explanation='Ball-and-socket joints (shoulder, hip) allow multi-directional movement including rotation.',
                            choices=[('Hinge joint', False), ('Ball-and-socket joint', True), ('Neither allows rotation', False)],
                        ),
                    ],
                ),
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_physiology_course(self, author):
        category = CourseCategory.objects.get(slug='exercise-physiology', sport=None)
        course = Course.objects.create(
            title='Exercise Physiology: Fundamentals',
            subtitle='How the body produces energy for exercise',
            description='Introduces the body\'s three energy systems and how training targets each one.',
            category=category, level='beginner', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Energy Systems Basics', order=1)

        lessons = [
            dict(
                title='The Three Energy Systems',
                lesson_type='text', order=1, estimated_minutes=9,
                learning_objectives='Name and describe the body\'s three main energy systems.',
                content='The body has three main systems for producing the energy (ATP) muscles need to contract, each dominant over a different duration and intensity.',
                scientific_explanation=(
                    'The phosphocreatine system provides energy very quickly but only for a few seconds, dominant '
                    'in maximal efforts like a single sprint or heavy lift. The glycolytic system takes over for '
                    'efforts lasting roughly seconds to a couple of minutes, breaking down carbohydrate without '
                    'needing much oxygen, but producing fatigue-related byproducts. The aerobic system uses '
                    'oxygen to sustain energy production over longer durations at lower intensities, and is the '
                    'main contributor for efforts lasting several minutes or more.'
                ),
                practical_application='Match conditioning work to the energy system the sport actually stresses — e.g. repeated short sprints stress the phosphocreatine/glycolytic systems, while a long steady run stresses the aerobic system.',
                key_coaching_points='Most sports use a blend of all three systems — identify the dominant one(s) for realistic conditioning design.',
                common_mistakes='Training only one energy system (e.g. only long steady-state cardio) when the sport actually demands a blend.',
                safety_considerations='None specific.',
                summary='The phosphocreatine, glycolytic, and aerobic systems each dominate over different effort durations — conditioning should match the blend the sport actually demands.',
                references='General exercise physiology energy-systems principles.',
                faqs=[
                    ('Do the three systems work in isolation?', 'No — they overlap and hand off to each other; the split is a helpful simplification, not a strict switch.'),
                ],
            ),
            dict(
                title='What Happens to Heart Rate and Breathing During Exercise',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Explain why heart rate and breathing rate increase during exercise.',
                content='As exercise intensity increases, the cardiovascular and respiratory systems work harder to meet the muscles\' demand for oxygen and fuel.',
                scientific_explanation='Working muscles need more oxygen and produce more carbon dioxide. Heart rate and stroke volume increase to pump more oxygenated blood to the muscles, and breathing rate/depth increase to bring in more oxygen and expel more carbon dioxide. These responses scale roughly with exercise intensity up to near-maximal effort.',
                practical_application='Heart rate response can be used as one practical signal of relative exercise intensity, alongside perceived exertion.',
                key_coaching_points='Heart rate is one useful signal among several (including RPE) — not the only measure of effort.',
                common_mistakes='Relying on heart rate alone without considering perceived exertion or the type of effort (e.g. heavy strength work may not spike heart rate the same way sprinting does).',
                safety_considerations='Unusually high heart rate for a given effort level, or symptoms like dizziness/chest pain, warrant stopping and seeking medical assessment.',
                summary='Heart rate and breathing increase with exercise intensity to meet the muscles\' oxygen demand — useful as one intensity signal among several, not the only one.',
                references='General cardiovascular and respiratory exercise-physiology principles.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_biomechanics_course(self, author):
        category = CourseCategory.objects.get(slug='sports-biomechanics', sport=None)
        course = Course.objects.create(
            title='Sports Biomechanics: Fundamentals',
            subtitle='How force, leverage, and technique interact in sporting movement',
            description='Introduces basic biomechanical concepts — force, leverage, and center of mass — as they apply to sporting movement and technique.',
            category=category, level='intermediate', status='published', estimated_hours=0.6, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Biomechanics Basics', order=1)

        lessons = [
            dict(
                title='Force, Leverage, and Why Technique Matters',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain why small technique changes can meaningfully affect force production.',
                content='How force is applied and where levers act both affect how efficiently an athlete can move or lift.',
                scientific_explanation='Joints act as levers, with muscles applying force at some distance from the joint (the "moment arm"). Small changes in body position can change these moment arms significantly, altering how much muscular force is required to produce the same movement — which is part of why technique changes can have an outsized effect on performance and injury risk.',
                practical_application='When coaching technique, consider not just "does it look right" but "does this position give the athlete better leverage to produce force safely."',
                key_coaching_points='A technique cue that changes body position is often really changing the leverage the athlete is working with.',
                common_mistakes='Treating technique purely as aesthetic rather than understanding the mechanical reason behind a cue.',
                safety_considerations='Poor leverage positions (e.g. a rounded back under load) can dramatically increase stress on joints/tissues even with the same external load.',
                summary='Technique changes often work by altering the leverage (moment arms) an athlete is working with, which is part of why they can meaningfully affect force output and safety.',
                references='General biomechanics principles (levers, moment arms) used in sports-science coach education.',
                faqs=[],
            ),
            dict(
                title='Center of Mass and Balance',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Explain the basic relationship between center of mass and balance/stability.',
                content='An athlete\'s center of mass and how it relates to their base of support affects their balance and stability.',
                scientific_explanation='Stability is generally greater when an athlete\'s center of mass stays over their base of support (e.g. the area between the feet). Widening the base of support, lowering the center of mass, or anticipating a shift in direction (as in an athletic ready position) all increase stability, which is part of why athletic stances are widened and lowered before explosive actions.',
                practical_application='Coach a wide, lowered athletic stance before actions requiring quick reaction or stability (e.g. defensive positions, change-of-direction starts).',
                key_coaching_points='A lower, wider stance generally trades some speed of initial movement for greater stability — the right balance depends on the specific task.',
                common_mistakes='Standing tall and narrow right before needing to react quickly or absorb contact, reducing stability when it matters most.',
                safety_considerations='None specific.',
                summary='Keeping the center of mass over a wide, low base of support increases stability — a principle behind why athletic ready stances are widened and lowered.',
                references='General biomechanics principles (center of mass, base of support) used in sports-science coach education.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_hydration_course(self, author):
        category = CourseCategory.objects.get(slug='hydration', sport=None)
        course = Course.objects.create(
            title='Hydration Fundamentals',
            subtitle='Why fluid balance matters for training and performance',
            description='Introduces why hydration affects performance and basic practical fluid intake principles around training.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Hydration Basics', order=1)

        lessons = [
            dict(
                title='Why Hydration Affects Performance',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Explain why even mild dehydration can affect exercise performance.',
                content='Body water plays several roles relevant to exercise performance, including regulating temperature and supporting blood volume.',
                scientific_explanation='Sweating cools the body during exercise but also causes fluid loss. Even mild dehydration (a small percentage of body weight lost as sweat) is commonly associated with reduced blood volume, higher relative cardiovascular strain, impaired temperature regulation, and perceived effort feeling higher for the same workload.',
                practical_application='Encourage athletes to start training sessions already well-hydrated, rather than trying to catch up on fluids only during the session.',
                key_coaching_points='Hydration status going INTO a session matters as much as fluid intake during it.',
                common_mistakes='Only thinking about hydration during exercise, ignoring hydration status beforehand.',
                safety_considerations='Significant dehydration combined with heat can contribute to serious heat-illness risk — this warrants genuine caution in hot conditions, not just a performance consideration.',
                summary='Body water supports temperature regulation and blood volume during exercise — even mild dehydration is linked to reduced performance and higher perceived effort.',
                references='General exercise hydration physiology principles.',
                faqs=[],
            ),
            dict(
                title='Practical Fluid Intake Around Training',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe simple, practical fluid intake guidance around a training session.',
                content='Simple habits around fluid intake before, during, and after training support hydration status without needing precise calculations for most athletes.',
                scientific_explanation='General guidance commonly used in practice: drink fluids in the hours before a session so urine is pale yellow (a rough practical indicator), sip fluids regularly during longer or hotter sessions, and replace fluids afterward — with sports drinks containing electrolytes potentially useful for longer or heavier-sweating sessions rather than typically necessary for short, low-intensity ones.',
                practical_application='Use urine color as a simple, practical everyday hydration check, drink regularly (not just when very thirsty) during longer sessions, and rehydrate afterward.',
                key_coaching_points='Simple habits (regular sipping, checking urine color) are more sustainable for most athletes than precise sweat-rate calculations.',
                common_mistakes='Waiting until feeling very thirsty before drinking, by which point some dehydration has often already occurred.',
                safety_considerations='Excessive water intake without any electrolyte replacement during very long, heavy-sweating efforts carries its own rare but serious risk (hyponatremia) — extreme cases warrant professional guidance, not general coaching advice.',
                summary='Simple habits — drinking ahead of a session, sipping regularly during longer efforts, and rehydrating afterward — cover most athletes\' hydration needs without precise calculation.',
                references='General practical hydration guidance used in sports nutrition coaching.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_cricket_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='cricket')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Cricket: Physical Demands',
            subtitle='What competitive cricket asks of an athlete\'s body',
            description='An introduction to the varied movement and energy-system demands across cricket\'s different roles and formats.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)

        lessons = [
            dict(
                title='Movement and Energy System Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe how cricket\'s physical demands vary by role and format.',
                content='Cricket\'s demands differ substantially by role (batting, bowling, fielding) and format (short vs long duration).',
                scientific_explanation=(
                    'Fast bowling involves repeated, high-force, whole-body actions (the bowling action) with '
                    'substantial recovery between deliveries, stressing rotational power and repeated-effort '
                    'capacity. Batting demands short bursts of sprinting between wickets and rotational power for '
                    'shot-making. Fielding demands reactive sprinting, diving, and throwing. Longer formats add '
                    'a significant aerobic-endurance and sustained-concentration demand on top of these.'
                ),
                practical_application='Tailor conditioning to the athlete\'s primary role — fast bowlers need rotational power and repeated-effort capacity specifically, while all players benefit from reactive sprint and throwing-power work.',
                key_coaching_points='Avoid training all players identically — a fast bowler and a specialist batter have meaningfully different primary conditioning needs.',
                common_mistakes='Applying one generic team conditioning template regardless of playing role.',
                safety_considerations='The fast bowling action places high, repeated rotational stress on the lower back and shoulder — bowling workload is a specific area requiring careful management.',
                summary='Cricket\'s demands vary substantially by role — fast bowling, batting, and fielding each stress different qualities, and conditioning should reflect the individual athlete\'s role.',
                references='General cricket physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Common Injury Areas in Cricket',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify commonly stressed areas in cricket and why.',
                content='Cricket\'s injury profile varies by role, with fast bowling carrying particularly well-documented risks.',
                scientific_explanation='Fast bowling\'s repeated, high-force rotational action is commonly associated with lower back stress (including stress injuries to the vertebrae in young, developing bowlers) and shoulder stress. Batters and fielders more commonly experience acute injuries from sprinting, diving, or being struck by the ball.',
                practical_application='Monitor and manage fast bowlers\' workload (number of deliveries) particularly carefully, especially in young, still-developing athletes, alongside core and shoulder strength work.',
                key_coaching_points='Bowling workload management is one of the most well-established injury-prevention practices specific to cricket.',
                common_mistakes='Allowing young fast bowlers high delivery workloads without structured monitoring or progression.',
                safety_considerations='Persistent lower back pain in a young fast bowler warrants prompt assessment — this is a well-documented, serious injury pattern in the sport.',
                summary='Fast bowling carries well-documented lower back and shoulder injury risk from its repeated rotational demands — workload management is a key, well-established prevention practice in cricket specifically.',
                references='General cricket injury-epidemiology principles used in sport-specific conditioning practice.',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_sports_science_foundations_course(self, author):
        category = CourseCategory.objects.get(slug='sports-science-foundations', sport=None)
        course = Course.objects.create(
            title='Sports Science Foundations 101',
            subtitle='The big-picture map of how sports science actually supports performance',
            description='An orientation course for coaches and athletes new to sports science: what the field covers, how its disciplines fit together, and how to use this Academy.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Orientation', order=1)
        lessons = [
            dict(
                title='What Sports Science Covers',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='List the main disciplines within sports science and what each contributes.',
                content='Sports science is an umbrella term covering several distinct but connected disciplines that together support athlete performance and health.',
                scientific_explanation=(
                    'Common disciplines include physiology (how the body produces energy and adapts to training), '
                    'biomechanics (how the body moves and generates force), psychology (mental skills and behaviour), '
                    'nutrition (fuelling and recovery), and medicine/physiotherapy (injury prevention and rehabilitation). '
                    'Coaching sits alongside these, translating findings from each discipline into practical training decisions.'
                ),
                practical_application='Use this map to know which discipline a question belongs to, and which specialist (physiotherapist, nutritionist, psychologist) to involve when a question goes beyond general coaching knowledge.',
                key_coaching_points='No single discipline has the full picture — good decisions usually draw on more than one.',
                common_mistakes='Treating sports science as a single monolithic topic rather than a set of connected specialisms.',
                safety_considerations='Questions involving injury, medical symptoms, or clinical diagnosis belong with qualified medical professionals, not general coaching judgement.',
                summary='Sports science spans physiology, biomechanics, psychology, nutrition, and medicine — each contributes a different lens on performance and health.',
                references='General sports-science curriculum structure used in coach education.',
                faqs=[
                    ('Do I need to be an expert in all of these areas?', 'No — the goal is enough working knowledge to make sound day-to-day decisions and to know when to bring in a specialist.'),
                ],
            ),
            dict(
                title='How to Use This Academy',
                lesson_type='text', order=2, estimated_minutes=6,
                learning_objectives='Describe how courses, lessons, and certificates fit together in this platform.',
                content='This Academy is organized into courses, each made of modules and lessons, with optional quizzes and a certificate on completion.',
                scientific_explanation='Learning research generally supports breaking material into short, focused units (as used here) over long unstructured sessions, and using retrieval practice (quizzes) to strengthen retention rather than passive reading alone.',
                practical_application='Work through lessons in order within a course, attempt quizzes honestly before checking explanations, and revisit completed courses periodically rather than treating them as one-time reading.',
                key_coaching_points='Consistency over time matters more than completing many courses quickly.',
                common_mistakes='Skipping quizzes or rushing through lessons without engaging with the practical application sections.',
                safety_considerations='',
                summary='This Academy uses short focused lessons and quizzes by design — engage with both, in order, for the best learning outcome.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_sleep_course(self, author):
        category = CourseCategory.objects.get(slug='sleep-optimization', sport=None)
        course = Course.objects.create(
            title='Sleep Optimization: Fundamentals',
            subtitle='Why sleep is one of the most powerful, lowest-cost performance tools available',
            description='A practical introduction to why athletes need more sleep than the general population and how to protect it.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Sleep Basics for Athletes', order=1)
        lessons = [
            dict(
                title='Why Sleep Matters for Performance',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain the main ways sleep supports athletic performance and recovery.',
                content='Sleep is when much of the body\'s physical recovery and adaptation from training actually takes place.',
                scientific_explanation=(
                    'During deep sleep stages, the body releases growth hormone supporting tissue repair, while '
                    'sleep more broadly supports muscle protein synthesis, glycogen replenishment, immune function, '
                    'and central nervous system recovery. Sleep also plays a well-established role in memory '
                    'consolidation, which supports skill learning.'
                ),
                practical_application='Treat sleep as a trainable, schedulable part of the program rather than an afterthought — protect a consistent sleep and wake time, especially around heavy training blocks.',
                key_coaching_points='Athletes in heavy training blocks generally need more sleep than sedentary individuals, not less.',
                common_mistakes='Prioritizing extra training time or early-morning sessions at the direct cost of sleep duration.',
                safety_considerations='Chronic short sleep is associated with elevated injury risk in youth athletes in particular — persistent poor sleep is worth addressing directly, not ignoring.',
                summary='Sleep supports physical recovery, immune function, and learning — it deserves the same deliberate scheduling as training itself.',
                references='General sleep-science principles used in athlete-recovery education.',
                faqs=[],
            ),
            dict(
                title='Practical Sleep Hygiene for Athletes',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='List practical habits that support consistent, quality sleep.',
                content='Simple, consistent habits ("sleep hygiene") have a meaningful effect on sleep quality and are within every athlete\'s control.',
                scientific_explanation='A cool, dark, quiet sleep environment, a consistent sleep/wake schedule, and reduced screen/blue-light exposure before bed all support the body\'s natural circadian and melatonin-driven sleep signaling. Late caffeine intake and late intense training can both delay sleep onset.',
                practical_application='Encourage a consistent bedtime and wake time (including on rest days), limiting caffeine in the afternoon/evening, and winding down screens before bed.',
                key_coaching_points='Consistency of schedule matters as much as total duration.',
                common_mistakes='Wildly inconsistent sleep/wake times between training days and rest days.',
                safety_considerations='Persistent sleep difficulty despite good habits may warrant a conversation with a medical professional rather than being managed through coaching alone.',
                summary='Consistent sleep/wake timing, a good sleep environment, and mindful caffeine/screen use are practical, low-cost levers every athlete can pull.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_movement_screening_course(self, author):
        category = CourseCategory.objects.get(slug='movement-screening', sport=None)
        course = Course.objects.create(
            title='Movement Screening: Fundamentals',
            subtitle='Using simple movement checks to spot limitations before they become injuries',
            description='An introduction to why and how coaches use basic movement screening as part of athlete monitoring.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Screening Basics', order=1)
        lessons = [
            dict(
                title='Why Screen Movement at All',
                lesson_type='text', order=1, estimated_minutes=7,
                learning_objectives='Explain the purpose of movement screening and its limitations.',
                content='Movement screening looks at how an athlete moves through basic patterns (squatting, lunging, reaching) to spot obvious asymmetries or restrictions.',
                scientific_explanation='Screens like these are intended to flag gross limitations in mobility, stability, or movement quality for further attention — the evidence for screens precisely predicting individual injury risk is mixed, so they are best used as one input among several rather than a standalone diagnostic tool.',
                practical_application='Use screening results to guide individualized warm-up and mobility work, not as a pass/fail gate for participation.',
                key_coaching_points='A screen is a starting conversation, not a diagnosis.',
                common_mistakes='Over-interpreting a single screening session as a precise predictor of future injury.',
                safety_considerations='Any pain reported during screening (rather than simple restriction or asymmetry) should be referred to a qualified medical professional.',
                summary='Movement screening flags gross movement limitations to guide individualized work — it is a useful input, not a precise injury-prediction tool on its own.',
                references='General movement-screening practice used in athletic preparation.',
                faqs=[],
            ),
            dict(
                title='Common Basic Screens Coaches Use',
                lesson_type='text', order=2, estimated_minutes=8,
                learning_objectives='Describe a few commonly used basic movement checks.',
                content='Coaches commonly check overhead squat pattern, single-leg balance, and ankle/hip mobility as simple, low-equipment starting points.',
                scientific_explanation='The overhead squat pattern reveals ankle, hip, and thoracic mobility restrictions together; single-leg balance highlights side-to-side stability differences; ankle dorsiflexion range affects squat and landing mechanics broadly across sports.',
                practical_application='Run a short, consistent screening routine periodically (e.g., pre-season and at intervals through the season) and track changes over time for each athlete rather than comparing athletes to each other.',
                key_coaching_points='Track each athlete against their own baseline over time.',
                common_mistakes='Comparing one athlete\'s screen results directly against a teammate\'s as if there is one universal "correct" standard.',
                safety_considerations='',
                summary='A short, consistent set of basic checks (overhead squat, single-leg balance, ankle mobility) run periodically gives useful individual trend data over time.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_stretching_course(self, author):
        category = CourseCategory.objects.get(slug='stretching', sport=None)
        course = Course.objects.create(
            title='Stretching Fundamentals',
            subtitle='Static vs dynamic stretching, and when to use each',
            description='A practical guide to the main types of stretching and how to place them correctly around training and competition.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Stretching Basics', order=1)
        lessons = [
            dict(
                title='Static vs Dynamic Stretching',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Distinguish static and dynamic stretching and their typical uses.',
                content='Static stretching holds a lengthened muscle position for a period of time; dynamic stretching moves a joint through range actively and repeatedly.',
                scientific_explanation=(
                    'Static stretching immediately before high-intensity or power-based activity has been associated '
                    'in some research with short-term reductions in maximal force/power output, while dynamic '
                    'stretching that raises temperature and actively moves joints through range tends to prepare the '
                    'body for performance without this effect. Static stretching remains useful at other times, such '
                    'as after training or in separate mobility sessions.'
                ),
                practical_application='Favor dynamic stretching within a pre-competition or pre-training warm-up, and reserve longer static stretching for after training or standalone mobility sessions.',
                key_coaching_points='Timing matters as much as the stretch type itself.',
                common_mistakes='Holding long static stretches immediately before a maximal-power event or session.',
                safety_considerations='Stretching into sharp pain (rather than mild tension) is a sign to stop — pain signals potential tissue damage risk.',
                summary='Dynamic stretching suits pre-performance warm-ups; static stretching suits post-training or separate mobility work — placement matters more than picking a single "best" type.',
                references='General stretching-science principles used in warm-up design.',
                faqs=[],
            ),
            dict(
                title='Building a Simple Stretching Routine',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Outline how to structure a basic stretching routine for an athlete.',
                content='A simple, sustainable stretching routine targets the muscle groups most relevant to the athlete\'s sport rather than trying to cover the whole body every session.',
                scientific_explanation='Consistency over time produces more durable range-of-motion changes than infrequent, long sessions — regular shorter sessions targeting sport-relevant muscle groups (e.g., hip flexors and hamstrings for sprinters) are generally more practical and effective than occasional exhaustive full-body sessions.',
                practical_application='Identify 3-5 muscle groups most relevant to the athlete\'s sport and have them stretch those consistently a few times per week, rather than attempting a long, infrequent full-body routine.',
                key_coaching_points='Consistency beats occasional intensity for range-of-motion gains.',
                common_mistakes='Doing one long, thorough stretching session occasionally instead of shorter, consistent sessions.',
                safety_considerations='',
                summary='A short, sport-relevant, consistent stretching routine beats an occasional exhaustive one for lasting range-of-motion improvement.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_volleyball_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='volleyball')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Volleyball: Physical Demands',
            subtitle='What competitive volleyball asks of an athlete\'s body',
            description='An introduction to the jumping, landing, and reactive movement demands that define volleyball conditioning.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)
        lessons = [
            dict(
                title='Jump and Landing Demands',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe the repeated jumping and landing demands specific to volleyball.',
                content='Volleyball involves very high numbers of jumps per match and per season across attacking, blocking, and serving actions.',
                scientific_explanation=(
                    'Repeated jump-landing cycles place high, repetitive load through the patellar tendon and '
                    'surrounding knee structures, and volleyball players are consequently a commonly cited '
                    'population for patellar tendon overuse issues ("jumper\'s knee") in sports-science literature. '
                    'Blocking additionally demands rapid lateral movement and reactive timing alongside the jump itself.'
                ),
                practical_application='Build lower-body eccentric strength and landing mechanics work into conditioning, and monitor cumulative jump counts across practice and matches rather than only match-day jumps.',
                key_coaching_points='Total jump volume across a week, not just match day, drives cumulative load.',
                common_mistakes='Tracking match jump counts only and ignoring high jump volumes accumulated in practice.',
                safety_considerations='Persistent anterior knee pain in a volleyball athlete is a common, well-documented pattern worth assessing early rather than "playing through".',
                summary='Volleyball\'s repeated jump-landing demands make cumulative jump volume and landing mechanics key conditioning and monitoring priorities.',
                references='General volleyball physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Reactive Agility and Shoulder Demands',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify the reactive movement and overhead-arm demands specific to volleyball.',
                content='Beyond jumping, volleyball requires rapid reactive movement to the ball and repeated overhead arm actions in serving and attacking.',
                scientific_explanation='Repeated, forceful overhead arm-swing actions (spiking, serving) place cumulative load through the shoulder complex, a commonly monitored area in volleyball conditioning, alongside the reactive lateral and forward movement demanded by digging and blocking.',
                practical_application='Include shoulder-focused strength and mobility work alongside reactive agility drills that mimic real in-game movement patterns.',
                key_coaching_points='Shoulder health work deserves the same deliberate attention as lower-body conditioning in this sport.',
                common_mistakes='Focusing conditioning almost entirely on jumping/legs while neglecting shoulder-specific preparation.',
                safety_considerations='Shoulder pain during or after serving/attacking actions is a common early warning sign worth addressing before it progresses.',
                summary='Volleyball combines high jump volume with repeated overhead-arm actions and reactive movement — conditioning should address legs, shoulders, and agility together.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_return_to_sport_course(self, author):
        category = CourseCategory.objects.get(slug='return-to-sport-concepts', sport=None)
        course = Course.objects.create(
            title='Return-to-Sport: Fundamentals',
            subtitle='Why "pain-free" is not the same as "ready to return"',
            description='An introduction to the criteria-based thinking coaches and rehab teams use to decide when an injured athlete is ready to return to full training and competition.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Return-to-Sport Basics', order=1)
        lessons = [
            dict(
                title='Why Return-to-Sport Is a Process, Not a Date',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Explain why a criteria-based approach is preferred over a fixed-date return.',
                content='Returning an athlete to sport based purely on a calendar date ("six weeks post-injury") ignores real individual variation in healing and readiness.',
                scientific_explanation=(
                    'Tissue healing timelines vary between individuals and injury severities, and pain resolution '
                    'does not necessarily mean full strength, control, and confidence have returned. Criteria-based '
                    'return-to-sport frameworks instead use measurable milestones (strength symmetry, hop-test '
                    'performance, sport-specific movement quality) to judge readiness on the individual, not the calendar.'
                ),
                practical_application='Work with a physiotherapist or medical professional to define objective, measurable milestones the athlete must meet before progressing return-to-sport stages, rather than relying on a fixed date.',
                key_coaching_points='"It doesn\'t hurt anymore" is necessary but not sufficient evidence of readiness.',
                common_mistakes='Clearing an athlete to return purely because a commonly cited timeframe has passed.',
                safety_considerations='Returning to full competition before meeting objective readiness criteria is associated with elevated re-injury risk — this decision should involve qualified medical/rehab professionals, not coaching judgement alone.',
                summary='Return-to-sport decisions should be criteria-based and individualized, not driven purely by a calendar date since pain-free does not automatically mean fully ready.',
                references='General return-to-sport framework principles used in athletic rehabilitation.',
                faqs=[],
            ),
            dict(
                title='The Staged Return-to-Play Idea',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Describe the general concept of graduated return-to-play stages.',
                content='Most return-to-sport frameworks use graduated stages, progressively reintroducing load, contact, and sport-specific complexity.',
                scientific_explanation='A typical progression moves from basic pain-free movement, to controlled loaded exercise, to sport-specific non-contact drills, to full-contact/competition simulation, with agreed criteria to progress at each stage rather than a fixed number of days per stage.',
                practical_application='Support the athlete through each stage patiently, resisting pressure to skip stages even when the athlete feels ready, and defer stage-progression decisions to the rehab/medical team where one is involved.',
                key_coaching_points='Skipping stages under competitive pressure is one of the most common preventable causes of re-injury.',
                common_mistakes='Fast-tracking a valued athlete through stages ahead of a big competition.',
                safety_considerations='Any regression in symptoms during a stage (renewed pain, swelling, instability) should pause progression and prompt reassessment.',
                summary='Graduated, criteria-gated stages — not a race against the calendar — define a sound return-to-sport progression.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_performance_testing_course(self, author):
        category = CourseCategory.objects.get(slug='performance-testing-assessment', sport=None)
        course = Course.objects.create(
            title='Performance Testing & Assessment: Fundamentals',
            subtitle='Choosing tests that actually tell you something useful',
            description='A practical introduction to selecting, running, and interpreting basic athletic performance tests.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Testing Basics', order=1)
        lessons = [
            dict(
                title='What Makes a Test Worth Running',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Identify what makes a performance test useful for a given sport and athlete.',
                content='Not every popular test is relevant to every sport — a good test should reflect a quality that actually matters for the athlete\'s performance.',
                scientific_explanation='Useful tests are generally reliable (produce consistent results on repeat testing under the same conditions) and relevant (measure a quality connected to the sport\'s real demands). A vertical jump test is highly relevant for a volleyball player\'s power, less directly relevant for a marathon runner\'s aerobic capacity.',
                practical_application='Choose a small set of tests tied directly to the specific demands of the athlete\'s sport and role, and run them under consistent conditions (same warm-up, time of day, equipment) each time for valid comparison.',
                key_coaching_points='Consistency of testing conditions matters as much as the test choice itself.',
                common_mistakes='Running an unrelated "standard" test battery regardless of the athlete\'s actual sport demands.',
                safety_considerations='Maximal-effort tests carry similar injury considerations to maximal training efforts and should be preceded by an adequate warm-up.',
                summary='A good performance test is reliable, relevant to the athlete\'s actual sport demands, and run under consistent conditions each time.',
                references='General performance-testing principles used in athlete assessment.',
                faqs=[],
            ),
            dict(
                title='Using Test Results Over Time',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Explain how to interpret changes in performance test results over time.',
                content='A single test result matters less than the trend across repeated testing over a season.',
                scientific_explanation='Normal day-to-day variation ("noise") exists in any physical test, so a single small change may not be meaningful — tracking results over multiple testing sessions helps separate a genuine trend from ordinary variation.',
                practical_application='Retest at consistent intervals (e.g., every 4-6 weeks) and look at the trend line across several sessions rather than reacting strongly to any single result.',
                key_coaching_points='One data point is an observation; several data points over time are a trend.',
                common_mistakes='Making major program changes based on a single test session without considering normal variability.',
                safety_considerations='',
                summary='Track performance tests over multiple sessions and interpret the trend, not any single result in isolation.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_monitoring_load_course(self, author):
        category = CourseCategory.objects.get(slug='monitoring-training-load', sport=None)
        course = Course.objects.create(
            title='Monitoring Training Load: Fundamentals',
            subtitle='Why tracking how hard athletes are actually working matters',
            description='An introduction to training load monitoring concepts, including session-RPE, and why sudden spikes in load are a known risk factor.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Load Monitoring Basics', order=1)
        lessons = [
            dict(
                title='What "Training Load" Means',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Define training load and describe the session-RPE method of estimating it.',
                content='Training load is a way of quantifying how much physical stress a training session or period placed on an athlete.',
                scientific_explanation=(
                    'A widely used simple method (session-RPE, from Foster et al.) multiplies a session\'s '
                    'duration in minutes by the athlete\'s self-rated perceived exertion (typically on a 1-10 scale) '
                    'to produce a single training load number, which can then be summed across a week or month to '
                    'track total accumulated load over time.'
                ),
                practical_application='Have athletes report session RPE shortly after each session and log duration, then track the resulting weekly total load alongside performance and wellness trends.',
                key_coaching_points='Session-RPE is simple to collect and requires no special equipment, which is part of why it is widely used.',
                common_mistakes='Collecting RPE data but never actually reviewing the resulting trends to inform program decisions.',
                safety_considerations='',
                summary='Training load quantifies session stress, and session-RPE (duration x perceived exertion) is a simple, widely used way to estimate and track it over time.',
                references='Foster et al. session-RPE methodology, as generally described in sports-science education.',
                faqs=[],
            ),
            dict(
                title='Why Sudden Load Spikes Are a Concern',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Explain why rapid increases in training load are associated with elevated injury risk.',
                content='A sharp, sudden increase in training load relative to what an athlete has recently been accustomed to is a well-documented injury risk factor.',
                scientific_explanation='Research on the relationship between acute and chronic training load broadly supports that large, rapid spikes in load relative to an athlete\'s recent training history are associated with elevated injury risk, more so than high absolute load reached gradually.',
                practical_application='Increase training load progressively and monitor weekly totals for sudden spikes, being especially cautious after a break (illness, holiday, injury) when an athlete\'s recent tolerance has dropped.',
                key_coaching_points='A sudden jump in load is often riskier than a gradually reached high load.',
                common_mistakes='Returning an athlete to full training volume immediately after a break without a gradual ramp-up.',
                safety_considerations='Be particularly cautious ramping load back up after any period of reduced training (illness, injury, off-season).',
                summary='Rapid spikes in training load relative to recent history are a well-documented injury risk factor — progressive increases and caution after breaks are key practical takeaways.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_agility_course(self, author):
        category = CourseCategory.objects.get(slug='agility', sport=None)
        course = Course.objects.create(
            title='Agility: Fundamentals',
            subtitle='Why agility is more than just running change-of-direction drills',
            description='An introduction to agility as a reactive, decision-based skill, not just pre-planned change-of-direction speed.',
            category=category, level='beginner', status='published', estimated_hours=0.5, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Agility Basics', order=1)
        lessons = [
            dict(
                title='Agility vs Change-of-Direction Speed',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Distinguish true agility from pre-planned change-of-direction drills.',
                content='"Agility" is often used loosely to describe cone or ladder drills, but true sporting agility includes a reactive, decision-making component.',
                scientific_explanation='Change-of-direction speed refers to the physical ability to decelerate, redirect, and re-accelerate along a pre-planned path. Agility, as used more precisely in sports science, adds a perceptual and decision-making component — reacting to an opponent, ball, or teammate rather than a known pattern.',
                practical_application='Include both pre-planned change-of-direction drills (to build the physical qualities) and reactive drills responding to a stimulus (a partner, a ball, a signal) to develop true game-relevant agility.',
                key_coaching_points='Cone drills alone build physical qualities but do not fully train the decision-making side of agility.',
                common_mistakes='Assuming pre-planned cone/ladder drills alone are sufficient to develop game agility.',
                safety_considerations='Rapid deceleration and direction change places high stress on the knee and ankle — ensure adequate strength preparation before high-intensity reactive agility work.',
                summary='True agility combines physical change-of-direction ability with reactive decision-making — train both, not just pre-planned patterns.',
                references='General agility-development principles used in athletic conditioning.',
                faqs=[],
            ),
            dict(
                title='Building an Agility Progression',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Outline a simple progression from basic to reactive agility work.',
                content='A sensible agility progression starts simple and pre-planned, then gradually adds reactive, sport-realistic complexity.',
                scientific_explanation='Progressing from closed (pre-planned, predictable) drills to open (reactive, unpredictable) drills allows athletes to first groove efficient movement mechanics before adding the cognitive load of real-time decision-making, which is closer to actual competition demand.',
                practical_application='Start young or less experienced athletes with simple pre-planned direction-change drills to build mechanics, then progressively add a reactive stimulus (partner mirror drills, reaction to a ball) as competency improves.',
                key_coaching_points='Progress from closed, predictable drills toward open, reactive ones as competency builds.',
                common_mistakes='Introducing complex reactive drills before basic movement mechanics are sound, leading to poor technique under pressure.',
                safety_considerations='',
                summary='Progress agility training from simple, pre-planned drills toward reactive, sport-realistic ones as the athlete\'s movement competency develops.',
                references='',
                faqs=[],
            ),
        ]
        self._create_lessons(module, lessons)

    def _seed_boxing_physical_demands_course(self, author):
        sport = Sport.objects.get(slug='boxing')
        category = CourseCategory.objects.get(sport=sport, slug='physical-demands')
        course = Course.objects.create(
            title='Boxing: Physical Demands',
            subtitle='What competitive boxing asks of an athlete\'s body',
            description='An introduction to the mixed energy-system and repeated high-force demands that define boxing conditioning.',
            category=category, level='beginner', status='published', estimated_hours=0.4, created_by=author,
        )
        module = CourseModule.objects.create(course=course, title='Understanding the Demands', order=1)
        lessons = [
            dict(
                title='Mixed Energy System Demands in Boxing',
                lesson_type='text', order=1, estimated_minutes=8,
                learning_objectives='Describe why boxing draws on multiple energy systems within a single bout.',
                content='A boxing round mixes short, high-intensity exchanges with lower-intensity movement and clinching, repeated across multiple rounds.',
                scientific_explanation='The high-intensity punching exchanges rely heavily on rapid, short-duration energy production, while sustained rounds and the need to recover between exchanges and rounds draw significantly on aerobic capacity as well — making boxing a genuinely mixed-energy-system sport rather than purely one or the other.',
                practical_application='Train both repeated high-intensity output (interval-style conditioning matching round/rest structure) and a solid aerobic base to support recovery between exchanges and rounds.',
                key_coaching_points='Round-and-rest interval conditioning that mirrors actual bout structure is a practical, sport-specific conditioning method.',
                common_mistakes='Training only steady aerobic conditioning or only maximal-intensity work, rather than both.',
                safety_considerations='This course covers general physical conditioning only — it does not address the specific medical/safety protocols required around head-impact sports, which require specialized medical oversight.',
                summary='Boxing genuinely mixes high-intensity anaerobic exchanges with an aerobic demand across rounds — conditioning should reflect both systems, matched to actual round/rest structure.',
                references='General boxing physical-demands literature used in sport-specific conditioning practice.',
                faqs=[],
            ),
            dict(
                title='Repeated-Effort and Rotational Demands',
                lesson_type='text', order=2, estimated_minutes=7,
                learning_objectives='Identify the repeated-effort and rotational-power demands specific to boxing.',
                content='Punching power comes substantially from hip and torso rotation transferred through the arm, repeated many times across a bout.',
                scientific_explanation='Effective punching technique relies on force generated from the legs and hips, transferred through a rotating torso — meaning rotational core strength and lower-body power are central conditioning priorities, not just upper-body/arm strength alone.',
                practical_application='Prioritize rotational core strength and lower-body power development alongside upper-body conditioning, rather than training punching power as a purely arm-strength quality.',
                key_coaching_points='Punching power is a whole-body, hip-driven quality, not an isolated arm movement.',
                common_mistakes='Overemphasizing isolated arm/shoulder strength work at the expense of rotational core and leg power.',
                safety_considerations='',
                summary='Boxing\'s punching power is a whole-body, rotational quality driven from the hips through the torso — conditioning should reflect this rather than focusing narrowly on the arms.',
                references='',
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
