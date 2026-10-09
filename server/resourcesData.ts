import { StudyResource, StudentLearningState } from '../src/types';

export const STUDY_RESOURCES: StudyResource[] = [
  // =========================================================================
  // DATA STRUCTURES (CS204)
  // =========================================================================
  {
    id: 'res-ds-visualgo',
    name: 'VisuAlgo',
    url: 'https://visualgo.net/en',
    category: 'Interactive Visualization',
    description: 'Visualising data structures and algorithms through animated step-by-step state transitions with custom inputs.',
    whyUseful: 'Critical for developing intuitive spatial models of tree rotations, graph traversals, and heap restructuring.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['trees-bst', 'graphs', 'sorting-searching', 'heaps', 'stacks-queues', 'arrays-linked-lists'],
    tags: ['Visualization', 'Trees', 'Graphs', 'Sorting', 'Algorithms'],
    featured: true
  },
  {
    id: 'res-ds-gfg',
    name: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/',
    category: 'Study Platforms',
    description: 'Learn concepts, examples and practice problems.',
    whyUseful: 'Provides line-by-line breakdown for every canonical data structure with diagrams and practice questions.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['arrays-linked-lists', 'stacks-queues', 'trees-bst', 'heaps-priority-queues', 'hashing', 'graphs', 'sorting-searching', 'dynamic-programming'],
    tags: ['Study Platforms', 'Data Structures', 'Tutorials', 'Implementations', 'Complexity Analysis', 'Reference'],
    featured: true
  },
  {
    id: 'res-ds-neetcode',
    name: 'NeetCode Practice Roadmap',
    url: 'https://neetcode.io/practice',
    category: 'Problem Solving',
    description: 'Structured roadmap of core algorithmic patterns (Two Pointers, Sliding Window, Trees, Graphs, DP) with video explanations.',
    whyUseful: 'Organizes coding problems by foundational pattern rather than raw difficulty, building systematic problem-solving skills.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['arrays-linked-lists', 'trees-bst', 'graphs', 'dynamic-programming', 'sorting-searching'],
    tags: ['Roadmap', 'Patterns', 'Video Solutions', 'Coding'],
    featured: true
  },
  {
    id: 'res-ds-leetcode',
    name: 'LeetCode Explore - Data Structures',
    url: 'https://leetcode.com/explore/',
    category: 'Practice',
    description: 'Interactive progression modules covering arrays, linked lists, binary trees, recursion, and hash tables.',
    whyUseful: 'Offers automated test validation with memory efficiency and runtime benchmark percentiles.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['arrays-linked-lists', 'stacks-queues', 'trees-bst', 'graphs', 'hashing'],
    tags: ['Interactive', 'Unit Tests', 'Coding', 'Benchmark']
  },
  {
    id: 'res-ds-w3schools',
    name: 'W3Schools',
    url: 'https://www.w3schools.com/',
    category: 'Study Platforms',
    description: 'Interactive tutorials and reference material.',
    whyUseful: 'Gentle, visual introduction to core data structures with animated diagrams and simple code examples.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['arrays-linked-lists', 'stacks-queues', 'trees-bst', 'heaps-priority-queues', 'hashing', 'graphs', 'sorting-searching', 'dynamic-programming'],
    tags: ['Study Platforms', 'Data Structures', 'Beginner Friendly', 'Quick Review', 'Interactive Examples'],
    featured: true
  },
  {
    id: 'res-ds-algo-visualizer',
    name: 'Algorithm Visualizer',
    url: 'https://algorithm-visualizer.org/',
    category: 'Simulators / Visualizers',
    description: 'Interactive code-driven algorithm visualization platform where execution steps highlight in live code side-by-side.',
    whyUseful: 'Allows modifying algorithm source code directly and observing how pointers and recursive call stacks react.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['sorting-searching', 'graphs', 'dynamic-programming', 'trees-bst'],
    tags: ['Code Step-Through', 'Interactive', 'Graph Traversal', 'Recursion']
  },
  {
    id: 'res-ds-hackerearth',
    name: 'HackerEarth Data Structures Practice',
    url: 'https://www.hackerearth.com/practice/data-structures/',
    category: 'Practice',
    description: 'Topic-by-topic problem sets with tutorial primers, varying difficulty, and time-restricted execution tests.',
    whyUseful: 'Reinforces individual topic fundamentals like Hash Tables, Heaps, and Disjoint Set Unions.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['hashing', 'heaps', 'trees-bst', 'graphs', 'arrays-linked-lists'],
    tags: ['Competitive Practice', 'Topic-Wise', 'Submissions']
  },
  {
    id: 'res-ds-bigo',
    name: 'Big-O Algorithm Complexity Cheat Sheet',
    url: 'https://www.bigocheatsheet.com/',
    category: 'Documentation / Reference',
    description: 'Definitive comparison chart of time and space complexities for all common data structures and sorting algorithms.',
    whyUseful: 'Authoritative lookup for worst, average, and best case Big-O bounds during exam preparation and algorithm analysis.',
    courseId: 'data-structures',
    courseTitle: 'Data Structures',
    relevantTopics: ['arrays-linked-lists', 'stacks-queues', 'trees-bst', 'hashing', 'sorting-searching'],
    tags: ['Big-O', 'Complexity', 'Reference', 'Exam Prep']
  },

  // =========================================================================
  // PYTHON FOR PROBLEM SOLVING (CS202)
  // =========================================================================
  {
    id: 'res-py-official-docs',
    name: 'Official Python Documentation & Tutorial',
    url: 'https://docs.python.org/3/tutorial/',
    category: 'Documentation / Reference',
    description: 'The definitive Python 3 tutorial and language reference maintained by the Python Software Foundation.',
    whyUseful: 'Authoritative specification for language semantics, built-in data types, standard library modules, and scoping rules.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-basics', 'py-data-structures', 'py-oop', 'py-file-io'],
    tags: ['Official Docs', 'Language Specification', 'Standard Library'],
    featured: true
  },
  {
    id: 'res-py-tutor',
    name: 'Python Tutor (Code Visualizer)',
    url: 'https://pythontutor.com/',
    category: 'Interactive Visualization',
    description: 'Visualize Python execution step-by-step showing pointer references, stack frames, and heap object mutations.',
    whyUseful: 'Eliminates confusion around list aliasing, variable mutation, parameter passing, and recursive call frames.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-basics', 'py-data-structures', 'py-algorithms', 'py-generators'],
    tags: ['Memory Visualizer', 'Call Stack', 'Variable Mutation', 'Debug'],
    featured: true
  },
  {
    id: 'res-py-real-python',
    name: 'Real Python In-Depth Tutorials',
    url: 'https://realpython.com/',
    category: 'Learn / Study',
    description: 'Industry-standard practical Python tutorials covering idiomatic Python, design patterns, and intermediate concepts.',
    whyUseful: 'Exceptional deep dives into generators, context managers (with statement), dunder methods, and decorators.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-oop', 'py-generators', 'py-file-io', 'py-data-structures'],
    tags: ['In-Depth', 'Pythonic Idioms', 'OOP', 'Generators'],
    featured: true
  },
  {
    id: 'res-py-w3schools',
    name: 'W3Schools',
    url: 'https://www.w3schools.com/',
    category: 'Study Platforms',
    description: 'Interactive tutorials and reference material.',
    whyUseful: 'Interactive Python playground with instant browser execution, exercises, and syntax reference.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-basics', 'py-data-structures', 'py-oop', 'py-generators', 'py-file-io', 'py-algorithms'],
    tags: ['Study Platforms', 'Python', 'Interactive Editor', 'Exercises', 'Reference'],
    featured: true
  },
  {
    id: 'res-py-gfg',
    name: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/',
    category: 'Study Platforms',
    description: 'Learn concepts, examples and practice problems.',
    whyUseful: 'Detailed Python tutorials covering fundamentals, data structures, algorithms, and practice problems.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-basics', 'py-data-structures', 'py-oop', 'py-generators', 'py-file-io', 'py-algorithms'],
    tags: ['Study Platforms', 'Python', 'Tutorials', 'Practice Problems', 'Examples'],
    featured: true
  },
  {
    id: 'res-py-exercism',
    name: 'Exercism Python Track',
    url: 'https://exercism.org/tracks/python',
    category: 'Project / Practical Learning',
    description: 'Free mentor-supported coding track emphasizing clean, idiomatic Python code and automated test-driven development.',
    whyUseful: 'Enforces PEP 8 style standards, docstrings, modular code structure, and test-driven development habits.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-basics', 'py-oop', 'py-generators', 'py-algorithms'],
    tags: ['Mentored Coding', 'Test-Driven', 'PEP 8', 'Clean Code']
  },
  {
    id: 'res-py-leetcode',
    name: 'LeetCode Python Problem Set',
    url: 'https://leetcode.com/problemset/all/',
    category: 'Problem Solving',
    description: 'Algorithmic challenge bank with Python 3 support, runtime benchmarks, and community solutions.',
    whyUseful: 'Sharpens algorithmic problem solving and time-efficient implementations using collections, bisect, and itertools.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-data-structures', 'py-algorithms'],
    tags: ['Algorithmic Thinking', 'Time Complexity', 'Interview Prep']
  },
  {
    id: 'res-py-pypi',
    name: 'PyPI (Python Package Index)',
    url: 'https://pypi.org/',
    category: 'Documentation / Reference',
    description: 'The official software repository for third-party Python packages and ecosystem libraries.',
    whyUseful: 'Explore package specifications, documentation, and external tools to extend Python functionality.',
    courseId: 'python-programming',
    courseTitle: 'Python for Problem Solving',
    relevantTopics: ['py-file-io', 'py-algorithms'],
    tags: ['Packages', 'Ecosystem', 'Dependencies']
  },

  // =========================================================================
  // JAVA PROGRAMMING (CS201)
  // =========================================================================
  {
    id: 'res-java-oracle-docs',
    name: 'Oracle Java SE Documentation',
    url: 'https://docs.oracle.com/en/java/',
    category: 'Documentation / Reference',
    description: 'The official Java Platform Standard Edition documentation and Java API specifications from Oracle.',
    whyUseful: 'The definitive source for Java class hierarchies, method contracts, exception specifications, and JVM behavior.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'inheritance', 'interfaces-abstract', 'exceptions', 'collections'],
    tags: ['Official Spec', 'API Documentation', 'Standard Edition'],
    featured: true
  },
  {
    id: 'res-java-dev-java',
    name: 'Dev.java (Official Portal for Java Developers)',
    url: 'https://dev.java/',
    category: 'Learn / Study',
    description: 'Modern tutorials, language guides, and learning paths curated directly by the Oracle Java platform group.',
    whyUseful: 'Authoritative coverage of modern Java syntax, records, sealed classes, pattern matching, and JVM memory concepts.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'inheritance', 'interfaces-abstract', 'collections'],
    tags: ['Official Guides', 'Modern Java', 'Tutorials'],
    featured: true
  },
  {
    id: 'res-java-visualizer',
    name: 'Java Visualizer (UW / CSCircles)',
    url: 'https://cscircles.cemc.uwaterloo.ca/java_visualize/',
    category: 'Interactive Visualization',
    description: 'Interactive memory diagram visualizer tracing Java Stack vs Heap allocations and object references.',
    whyUseful: 'Crucial for understanding how object references, instance variables, and method call frames operate in memory.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'inheritance'],
    tags: ['Stack vs Heap', 'Object References', 'Visual Execution'],
    featured: true
  },
  {
    id: 'res-java-baeldung',
    name: 'Baeldung on Java',
    url: 'https://www.baeldung.com/',
    category: 'Learn / Study',
    description: 'In-depth, code-first tutorials focusing on core Java, OOP design patterns, and Collections framework.',
    whyUseful: 'Pragmatic explanations of interfaces, abstract classes, exception management, and List/Set/Map internals.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['oop', 'inheritance', 'interfaces-abstract', 'exceptions', 'collections', 'generics'],
    tags: ['Design Patterns', 'Collections', 'Enterprise Java', 'Code Examples'],
    featured: true
  },
  {
    id: 'res-java-gfg',
    name: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/',
    category: 'Study Platforms',
    description: 'Learn concepts, examples and practice problems.',
    whyUseful: 'Comprehensive explanations of Java syntax, OOP principles, collections, and interview coding problems.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'inheritance', 'polymorphism', 'abstraction', 'interfaces', 'exception-handling', 'collections', 'file-handling', 'multithreading', 'jdbc'],
    tags: ['Study Platforms', 'Java', 'OOP', 'Code Examples', 'Practice Problems'],
    featured: true
  },
  {
    id: 'res-java-w3schools',
    name: 'W3Schools',
    url: 'https://www.w3schools.com/',
    category: 'Study Platforms',
    description: 'Interactive tutorials and reference material.',
    whyUseful: 'Interactive hands-on Java exercises and syntax reference with live browser execution.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'inheritance', 'polymorphism', 'abstraction', 'interfaces', 'exception-handling', 'collections', 'file-handling', 'multithreading', 'jdbc'],
    tags: ['Study Platforms', 'Java', 'Interactive Editor', 'Exercises', 'Reference'],
    featured: true
  },
  {
    id: 'res-java-codingbat',
    name: 'CodingBat Java Practice',
    url: 'https://codingbat.com/java',
    category: 'Practice',
    description: 'Live online Java coding problems with immediate feedback, grading unit tests, and warm-up exercises.',
    whyUseful: 'Builds automatic fluency with strings, arrays, loops, and logic branches through targeted drills.',
    courseId: 'java-programming',
    courseTitle: 'Java Programming',
    relevantTopics: ['fundamentals', 'oop', 'collections'],
    tags: ['Drills', 'Immediate Feedback', 'Unit Tests', 'Fluency']
  },

  // =========================================================================
  // WEB DEVELOPMENT (CS205)
  // =========================================================================
  {
    id: 'res-web-mdn',
    name: 'MDN Web Docs (Mozilla Developer Network)',
    url: 'https://developer.mozilla.org/',
    category: 'Documentation / Reference',
    description: 'The premier authoritative documentation for web standards: HTML, CSS, JavaScript, and Web APIs.',
    whyUseful: 'Unrivaled documentation with browser compatibility matrices, accessibility guidelines, and interactive examples.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['html-fundamentals', 'css-modern', 'js-core', 'js-async', 'web-apis'],
    tags: ['Standard Reference', 'Browser Support', 'Web APIs', 'HTML/CSS/JS'],
    featured: true
  },
  {
    id: 'res-web-w3schools',
    name: 'W3Schools',
    url: 'https://www.w3schools.com/',
    category: 'Study Platforms',
    description: 'Interactive tutorials and reference material.',
    whyUseful: "World-renowned interactive learning platform with 'Try it Yourself' live editors for HTML, CSS, JavaScript, and Web APIs.",
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['html-fundamentals', 'css-modern', 'js-core', 'js-async', 'web-apis', 'frontend-architecture'],
    tags: ['Study Platforms', 'HTML/CSS/JS', 'Interactive Editor', 'Try It Yourself', 'Reference'],
    featured: true
  },
  {
    id: 'res-web-gfg',
    name: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/',
    category: 'Study Platforms',
    description: 'Learn concepts, examples and practice problems.',
    whyUseful: 'Extensive web technology guides, frontend exercises, JavaScript tutorials, and web development practice questions.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['html-fundamentals', 'css-modern', 'js-core', 'js-async', 'web-apis', 'frontend-architecture'],
    tags: ['Study Platforms', 'Web Development', 'JavaScript', 'Practice Problems', 'Examples'],
    featured: true
  },
  {
    id: 'res-web-frontend-mentor',
    name: 'Frontend Mentor',
    url: 'https://www.frontendmentor.io/',
    category: 'Project / Practical Learning',
    description: 'Real-world frontend challenges based on professional Figma design specs with automated test reviews.',
    whyUseful: 'Bridges the gap between theory and production code by building actual responsive web projects.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['html-fundamentals', 'css-modern', 'js-core', 'frontend-architecture'],
    tags: ['Real Projects', 'Figma Designs', 'Responsive Layouts'],
    featured: true
  },
  {
    id: 'res-web-codepen',
    name: 'CodePen Online Development Sandbox',
    url: 'https://codepen.io/',
    category: 'Coding / Development',
    description: 'Social development environment for frontend designers and developers with real-time browser preview.',
    whyUseful: 'Prototype HTML/CSS/JS snippets, flexbox layouts, and animations instantly without local tooling.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['css-modern', 'js-core', 'frontend-architecture'],
    tags: ['Sandbox', 'Live Preview', 'CSS Grid', 'Prototypes'],
    featured: true
  },
  {
    id: 'res-web-js-info',
    name: 'JavaScript.info (The Modern JavaScript Tutorial)',
    url: 'https://javascript.info/',
    category: 'Learn / Study',
    description: 'From the basics to advanced topics like promises, closures, async/await, and event loops.',
    whyUseful: 'Explains the JavaScript runtime, call stack, and DOM event propagation with great clarity.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['js-core', 'js-async', 'web-apis'],
    tags: ['Modern JS', 'Event Loop', 'Async/Await', 'DOM']
  },
  {
    id: 'res-web-css-tricks',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/',
    category: 'Documentation / Reference',
    description: 'Daily articles, guides, and the definitive visual almanac for CSS Flexbox and CSS Grid.',
    whyUseful: 'The most trusted visual reference for responsive web layout and modern styling techniques.',
    courseId: 'web-development',
    courseTitle: 'Web Development',
    relevantTopics: ['css-modern', 'frontend-architecture'],
    tags: ['Flexbox', 'CSS Grid', 'Visual Almanac', 'Responsive']
  }
];

/**
 * Normalizes course ID matching
 */
export function normalizeCourseId(courseId: string): string {
  if (!courseId) return '';
  const lower = courseId.toLowerCase().trim().replace(/_/g, '-');
  if (lower === 'java' || lower === 'java-programming' || lower === 'cs201') return 'java-programming';
  if (lower === 'data-structures' || lower === 'data structures' || lower === 'datastructures' || lower === 'ds' || lower === 'cs204') return 'data-structures';
  if (lower === 'python' || lower === 'python-programming' || lower === 'python-data-structures' || lower === 'cs202') return 'python-programming';
  if (lower === 'web-dev' || lower === 'web-development' || lower === 'web' || lower === 'cs205') return 'web-development';
  return lower;
}

/**
 * Generates an intelligent, context-aware "Why this resource?" explanation
 * based on the student's actual learning state, current topic, and knowledge gaps.
 */
export function generateResourceReason(
  resource: StudyResource,
  learningState?: StudentLearningState | null,
  selectedTopicId?: string
): string {
  // If student specifically filtered or selected a topic
  const activeTopic = selectedTopicId || learningState?.currentTopic;
  const isTopicMatch = activeTopic && resource.relevantTopics.some(t => t.toLowerCase() === activeTopic.toLowerCase());

  if (learningState) {
    // Check if the resource matches a known knowledge gap or weak topic
    const hasGapMatch = learningState.knowledgeGaps?.some(gap =>
      resource.relevantTopics.some(t => gap.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(gap.toLowerCase()))
    );

    const hasWeakMatch = learningState.weakTopics?.some(weak =>
      resource.relevantTopics.some(t => weak.toLowerCase() === t.toLowerCase())
    );

    if (hasGapMatch) {
      return `Recommended because your diagnostic assessment identified a knowledge gap in ${activeTopic || 'this topic'}. This resource provides focused step-by-step reinforcement.`;
    }

    if (hasWeakMatch) {
      return `Prioritized to strengthen your proficiency in ${activeTopic || 'core concepts'}, where recent assessments highlighted opportunity for review.`;
    }

    if (isTopicMatch && (resource.category === 'Interactive Visualization' || resource.category === 'Simulators / Visualizers')) {
      return `Recommended to help visualize dynamic state transitions and memory layouts for your active topic: ${activeTopic}.`;
    }

    if (isTopicMatch) {
      return `Directly aligned with your current syllabus study focus on ${activeTopic}.`;
    }
  }

  // Fallback based on resource category and purpose
  if (isTopicMatch) {
    return `Curated specifically for your syllabus topic: ${activeTopic}.`;
  }

  switch (resource.category) {
    case 'Study Platforms':
      return `Core recommended study platform to learn concepts, explore live examples, and solve practice problems for ${resource.courseTitle}.`;
    case 'Interactive Visualization':
    case 'Simulators / Visualizers':
      return 'Essential for building spatial intuition and observing code execution step-by-step.';
    case 'Documentation / Reference':
      return 'Authoritative language reference for official syntax, API contracts, and specifications.';
    case 'Problem Solving':
    case 'Practice':
      return 'Curated exercises and algorithmic drills to build implementation fluency.';
    case 'Project / Practical Learning':
      return 'Practical hands-on projects to bridge theoretical concepts with real-world code.';
    default:
      return `Core recommended learning platform for the ${resource.courseTitle} curriculum.`;
  }
}

/**
 * Filters and ranks study resources for a given course and student context
 */
export function getCourseResources(params: {
  courseId: string;
  topicId?: string;
  category?: string;
  learningState?: StudentLearningState | null;
}): StudyResource[] {
  const normId = normalizeCourseId(params.courseId);
  if (!normId) return [];

  let results = STUDY_RESOURCES.filter(r => r.courseId === normId);

  // Filter by category if requested
  if (params.category && params.category !== 'All') {
    results = results.filter(r => r.category.toLowerCase() === params.category!.toLowerCase());
  }

  // Attach context-aware recommendation reason to each resource
  const annotated = results.map(r => ({
    ...r,
    recommendedReason: generateResourceReason(r, params.learningState, params.topicId)
  }));

  // Rank resources:
  // 1. Topic matches first if topicId provided or student has active topic
  // 2. Knowledge gap / weak topic matches
  // 3. Featured resources
  const targetTopic = params.topicId || params.learningState?.currentTopic;

  annotated.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (targetTopic) {
      if (a.relevantTopics.some(t => t.toLowerCase() === targetTopic.toLowerCase())) scoreA += 50;
      if (b.relevantTopics.some(t => t.toLowerCase() === targetTopic.toLowerCase())) scoreB += 50;
    }

    if (params.learningState?.knowledgeGaps?.some(gap =>
      a.relevantTopics.some(t => gap.toLowerCase().includes(t.toLowerCase()))
    )) scoreA += 30;

    if (params.learningState?.knowledgeGaps?.some(gap =>
      b.relevantTopics.some(t => gap.toLowerCase().includes(t.toLowerCase()))
    )) scoreB += 30;

    if (a.featured) scoreA += 10;
    if (b.featured) scoreB += 10;

    // Prioritize primary Study Platforms (e.g. GeeksforGeeks, W3Schools)
    if (a.category === 'Study Platforms') scoreA += 15;
    if (b.category === 'Study Platforms') scoreB += 15;

    return scoreB - scoreA;
  });

  return annotated;
}
