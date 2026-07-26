"""
Seeds the Research Library with plain-language summaries of general,
well-established (or openly debated) sports-science topics.

Deliberately written in cautious, hedged language ("general consensus",
"widely used but debated") rather than citing specific studies, authors,
or organizations — the ResearchSummary model has no field for that on
purpose. This stays something we can actually stand behind.

Usage: python manage.py seed_research_library
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from academy.models import CourseCategory, ResearchSummary


ENTRIES = [
    dict(
        title='Does Static Stretching Before Exercise Reduce Injury Risk?',
        topic_slug='warm-up-systems',
        summary=(
            'The general consensus in exercise science is that long, held static stretches performed '
            'immediately before high-intensity activity do not reliably reduce injury risk, and can '
            'temporarily reduce muscular power output if the muscle is still cold. Dynamic, movement-based '
            'warm-ups that gradually raise temperature and rehearse the movement patterns of the session '
            'ahead are generally favored as the pre-activity approach, with static stretching reserved for '
            'after training or a separate mobility session.'
        ),
        practical_takeaways=(
            'Use dynamic movement to warm up before training or competition. Save longer, held static '
            'stretches for the cool-down or a dedicated flexibility session, not immediately before '
            'high-intensity work.'
        ),
    ),
    dict(
        title='How Much Sleep Do Young Athletes Actually Need?',
        topic_slug='sleep-optimization',
        summary=(
            'Adolescents generally need more sleep than adults to support both normal development and '
            'the additional recovery demands of regular training — commonly discussed guidance points '
            'toward roughly 8-10 hours per night for teenagers, more than the typical adult recommendation. '
            'Individual needs vary, and heavy training blocks or competition periods can increase the '
            'benefit of prioritizing consistent, adequate sleep.'
        ),
        practical_takeaways=(
            'Treat sleep duration and consistency as a trainable habit, particularly during heavy training '
            'or competition periods. Flag persistent, unusually short sleep as worth addressing, not '
            'ignoring.'
        ),
    ),
    dict(
        title='Is the Acute:Chronic Workload Ratio a Reliable Injury Predictor?',
        topic_slug='monitoring-training-load',
        summary=(
            'The acute:chronic workload ratio (comparing a short recent training-load window to a longer '
            'baseline average) is a widely used framework in sports science for thinking about injury risk '
            'linked to rapid load spikes. It is a useful conceptual tool and has reasonable face validity, '
            'but it is also actively debated in the field — it is not a precise, guaranteed predictor for '
            'any individual athlete, and should be treated as one input among several (including athlete '
            'wellness, sleep, and injury history), not a single definitive number.'
        ),
        practical_takeaways=(
            'Use load monitoring as one signal among several, not a standalone rule. Prioritize gradual, '
            'progressive load increases generally, especially after time off, rather than relying on a '
            'single ratio threshold.'
        ),
    ),
    dict(
        title='Do Foam Rolling and Self-Massage Actually Reduce Muscle Soreness?',
        topic_slug='foam-rolling',
        summary=(
            'Foam rolling and self-massage tools are generally associated with a modest, short-term '
            'reduction in perceived muscle soreness and a temporary increase in range of motion after '
            'use. The evidence for meaningful effects on longer-term recovery, injury prevention, or '
            'performance is much less clear-cut, and effects on perceived soreness do not necessarily mean '
            'meaningful physiological change. It is best understood as a low-risk tool that may help '
            'athletes feel better in the short term, not a proven recovery accelerant.'
        ),
        practical_takeaways=(
            'Foam rolling is reasonable to include as a low-risk comfort/mobility tool, but should not '
            'replace fundamentals like adequate sleep, nutrition, and progressive load management.'
        ),
    ),
    dict(
        title='Does Cold Water Immersion Help Recovery?',
        topic_slug='cold-therapy',
        summary=(
            'Cold water immersion after exercise is commonly associated with a short-term reduction in '
            'perceived muscle soreness. However, some research suggests that using cold water immersion '
            'regularly and immediately after strength/hypertrophy-focused training may blunt some of the '
            'longer-term muscular adaptations to that training, since part of the adaptation process '
            'involves the same inflammatory response cold exposure dampens. The practical implication is '
            'timing- and goal-dependent rather than a simple "always helpful."'
        ),
        practical_takeaways=(
            'Cold water immersion may be reasonable after competition or when same-day recovery matters '
            'more than long-term adaptation. Consider avoiding it immediately after key strength-building '
            'sessions if maximizing long-term strength/muscle adaptation is the priority.'
        ),
    ),
    dict(
        title='Does Strength Training Alone Improve Flexibility?',
        topic_slug='flexibility',
        summary=(
            'A common assumption is that strength training "tightens" muscles and reduces flexibility, but '
            'the general evidence does not support this — strength training performed through a full range '
            'of motion is generally associated with maintaining or even modestly improving flexibility, not '
            'reducing it. This differs from strength training performed only through a partial range of '
            'motion, which would not be expected to carry the same flexibility benefit. Strength training '
            'is not a replacement for dedicated flexibility work aimed at ranges beyond what training '
            'movements use, but the "strength training makes you inflexible" assumption is generally not '
            'well supported when full range of motion is used.'
        ),
        practical_takeaways=(
            'Prioritize full range of motion in strength exercises rather than partial reps, which supports '
            'flexibility maintenance as a side benefit. Add dedicated mobility/flexibility work specifically '
            'for ranges beyond what training movements use.'
        ),
    ),
    dict(
        title='Does Caffeine Actually Improve Athletic Performance?',
        topic_slug='sports-nutrition',
        summary=(
            'Caffeine is one of the more consistently supported performance aids in sports nutrition '
            'research, generally associated with modest improvements in endurance performance and perceived '
            'effort at moderate doses. Individual response varies considerably (partly due to genetic '
            'differences in caffeine metabolism), and higher doses do not necessarily produce proportionally '
            'greater benefit while increasing side-effect risk (jitteriness, sleep disruption if taken late). '
            'Regular heavy caffeine users may also experience a smaller relative benefit than infrequent '
            'users.'
        ),
        practical_takeaways=(
            'If used, trial caffeine timing and dose in training before competition, not for the first time '
            'on competition day. Be mindful of the effect on sleep if training or competing later in the day.'
        ),
    ),
    dict(
        title='Is There a Strict "Anabolic Window" for Post-Workout Protein?',
        topic_slug='sports-nutrition',
        summary=(
            'The idea of a narrow post-workout window (often cited as ~30-60 minutes) during which protein '
            'must be consumed to gain the training benefit has been substantially challenged by more recent '
            'research. Total daily protein intake and its distribution across the day appear considerably '
            'more important than hitting a precise short post-workout window, especially for athletes who '
            'have eaten a normal meal within a few hours before training. The "window" concept still has '
            'some relevance in specific contexts (e.g., training fasted, or very tight same-day double '
            'sessions), but is not the strict rule it is sometimes presented as.'
        ),
        practical_takeaways=(
            'Focus primarily on adequate total daily protein intake spread reasonably evenly across meals, '
            'rather than treating a specific post-workout minute count as make-or-break.'
        ),
    ),
    dict(
        title='Does Listening to Music Improve Athletic Performance?',
        topic_slug='sports-psychology',
        summary=(
            'Music is generally associated with modest performance and effort-perception benefits in '
            'training, particularly for steady, submaximal endurance efforts — likely through reduced '
            'perceived effort and improved mood/motivation rather than a direct physiological performance '
            'boost. Effects appear smaller or negligible for very high-intensity, maximal efforts, where '
            'the physiological demand may outweigh music\'s psychological effect. Rules in many competitive '
            'settings also restrict music use during actual competition, making this primarily a training-tool '
            'consideration.'
        ),
        practical_takeaways=(
            'Music may be a reasonable tool to support motivation and reduce perceived effort during '
            'moderate-intensity training, but check competition rules before assuming it can be used on '
            'competition day.'
        ),
    ),
]


class Command(BaseCommand):
    help = 'Seed the Research Library with plain-language, general sports-science summaries'

    def handle(self, *args, **options):
        author = User.objects.filter(is_superuser=True).first()
        created = 0

        for entry in ENTRIES:
            if ResearchSummary.objects.filter(title=entry['title']).exists():
                continue
            topic = CourseCategory.objects.filter(slug=entry['topic_slug'], sport=None).first()
            ResearchSummary.objects.create(
                title=entry['title'],
                topic=topic,
                summary=entry['summary'],
                practical_takeaways=entry['practical_takeaways'],
                last_reviewed=timezone.now().date(),
                created_by=author,
            )
            created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'Seeded {created} research summaries.'))
        else:
            self.stdout.write(self.style.WARNING('All research summaries already exist. Nothing to do.'))
