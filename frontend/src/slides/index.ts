// BOLUM 0: GIRIS
import TitleSlide from './01-intro/TitleSlide'
import AgendaSlide from './01-intro/AgendaSlide'
import StoryIntroSlide from './01-intro/StoryIntroSlide'

// BOLUM 1: CACHE TEMELLERI
import WhyCacheSlide from './02-cache-fundamentals/WhyCacheSlide'
import CacheLayersSlide from './02-cache-fundamentals/CacheLayersSlide'
import WhenToCacheSlide from './02-cache-fundamentals/WhenToCacheSlide'
import SpeedDemoSlide from './02-cache-fundamentals/SpeedDemoSlide'

// BOLUM 2: CACHE PATTERNLERI
import PatternProblemSlide from './03-cache-patterns/PatternProblemSlide'
import CacheAsideSlide from './03-cache-patterns/CacheAsideSlide'
import ReadThroughSlide from './03-cache-patterns/ReadThroughSlide'
import WriteThroughSlide from './03-cache-patterns/WriteThroughSlide'
import PatternComparisonSlide from './03-cache-patterns/PatternComparisonSlide'
import PatternDemoSlide from './03-cache-patterns/PatternDemoSlide'

// BOLUM 3: TTL & KEY TASARIMI
import StaleDataProblemSlide from './04-ttl-invalidation/StaleDataProblemSlide'
import TTLConceptSlide from './04-ttl-invalidation/TTLConceptSlide'
import InvalidationStrategiesSlide from './04-ttl-invalidation/InvalidationStrategiesSlide'
import KeyStandardsSlide from './05-cache-keys/KeyStandardsSlide'
import TTLDemoSlide from './04-ttl-invalidation/TTLDemoSlide'
import TTLStrategyDemoSlide from './04-ttl-invalidation/TTLStrategyDemoSlide'

// BOLUM 4: CACHE PROBLEMLERI
import ProblemIntroSlide from './06-cache-problems/ProblemIntroSlide'
import StampedeSlide from './06-cache-problems/StampedeSlide'
import StampedeSolutionSlide from './06-cache-problems/StampedeSolutionSlide'
import PenetrationSlide from './06-cache-problems/PenetrationSlide'
import NullCachingSlide from './06-cache-problems/NullCachingSlide'
import ProblemDemoSlide from './06-cache-problems/ProblemDemoSlide'

// BOLUM 5: DAYANIKLILIK
import ResilienceProblemSlide from './07-resilience/ResilienceProblemSlide'
import FailOpenCloseSlide from './07-resilience/FailOpenCloseSlide'
import CircuitBreakerSlide from './07-resilience/CircuitBreakerSlide'
import ConsistencySlide from './07-resilience/ConsistencySlide'
import ResilienceDemoSlide from './07-resilience/ResilienceDemoSlide'

// BOLUM 6: DAGITIK KILIT
import WhyDistLockSlide from './08-distributed-lock/WhyDistLockSlide'
import RedissonIntroSlide from './08-distributed-lock/RedissonIntroSlide'
import LockMechanicsSlide from './08-distributed-lock/LockMechanicsSlide'
import TimeoutLeaseSlide from './08-distributed-lock/TimeoutLeaseSlide'
import OwnerVerificationSlide from './08-distributed-lock/OwnerVerificationSlide'
import LockDemoSlide from './08-distributed-lock/LockDemoSlide'
import RedlockAlgorithmSlide from './09-redlock/RedlockAlgorithmSlide'
import RedlockVsSingleSlide from './09-redlock/RedlockVsSingleSlide'
import ScheduledJobSlide from './09-redlock/ScheduledJobSlide'

// BOLUM 7: IZLEME & TEST
import MonitoringProblemSlide from './10-monitoring/MonitoringProblemSlide'
import MetricsOverviewSlide from './10-monitoring/MetricsOverviewSlide'
import MetricsDemoSlide from './10-monitoring/MetricsDemoSlide'
import ConcurrencyTestSlide from './11-testing/ConcurrencyTestSlide'

// BOLUM 8: KAPANIS
import SummarySlide from './12-conclusion/SummarySlide'
import QASlide from './12-conclusion/QASlide'

export const slides = [
  // BOLUM 0: GIRIS (3)
  TitleSlide,              // 1
  AgendaSlide,             // 2
  StoryIntroSlide,         // 3

  // BOLUM 1: CACHE TEMELLERI (4)
  WhyCacheSlide,           // 4
  CacheLayersSlide,        // 5
  WhenToCacheSlide,        // 6
  SpeedDemoSlide,          // 7

  // BOLUM 2: CACHE PATTERNLERI (6)
  PatternProblemSlide,     // 8
  CacheAsideSlide,         // 9
  ReadThroughSlide,        // 10
  WriteThroughSlide,       // 11
  PatternComparisonSlide,  // 12
  PatternDemoSlide,        // 13

  // BOLUM 3: TTL & KEY TASARIMI (5)
  StaleDataProblemSlide,   // 14
  TTLConceptSlide,         // 15
  InvalidationStrategiesSlide, // 16
  KeyStandardsSlide,       // 17
  TTLDemoSlide,            // 18
  TTLStrategyDemoSlide,    // 19

  // BOLUM 4: CACHE PROBLEMLERI (6)
  ProblemIntroSlide,       // 19
  StampedeSlide,           // 20
  StampedeSolutionSlide,   // 21
  PenetrationSlide,        // 22
  NullCachingSlide,        // 23
  ProblemDemoSlide,        // 24

  // BOLUM 5: DAYANIKLILIK (5)
  ResilienceProblemSlide,  // 25
  FailOpenCloseSlide,      // 26
  CircuitBreakerSlide,     // 27
  ConsistencySlide,        // 28
  ResilienceDemoSlide,     // 29

  // BOLUM 6: DAGITIK KILIT (9)
  WhyDistLockSlide,        // 29
  RedissonIntroSlide,      // 30 - Redisson Nedir?
  LockMechanicsSlide,      // 31
  TimeoutLeaseSlide,       // 31
  OwnerVerificationSlide,  // 32
  LockDemoSlide,           // 33
  RedlockAlgorithmSlide,   // 34
  RedlockVsSingleSlide,    // 35
  ScheduledJobSlide,       // 36

  // BOLUM 7: IZLEME & TEST (4)
  MonitoringProblemSlide,  // 37
  MetricsOverviewSlide,    // 38
  MetricsDemoSlide,        // 39
  ConcurrencyTestSlide,    // 40

  // BOLUM 8: KAPANIS (2)
  SummarySlide,            // 41
  QASlide,                 // 42
]
