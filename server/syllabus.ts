import { Course, Topic } from '../src/types';

export const COURSES: Course[] = [
  {
    id: 'java-programming',
    title: 'Java Programming',
    code: 'CS201',
    tagline: 'Object-Oriented Programming & Modern Enterprise Architecture',
    description: 'Master core Java, object-oriented paradigms, inheritance hierarchies, interfaces, exception management, collections framework, and database connectivity.',
    level: 'Comprehensive (Beginner to Advanced)',
    icon: 'Coffee',
    totalTopics: 11,
    estimatedHours: 42,
    topics: [
      {
        id: 'fundamentals',
        title: 'Fundamentals',
        description: 'Variables, data types, control flow, loops, methods, and memory model (Stack vs Heap).',
        category: 'Core Language',
        order: 1,
        prerequisites: [],
        subtopics: ['Primitive Data Types', 'Control Flow (if/else, switch)', 'Loops (for, while, do-while)', 'Methods and Scopes', 'Stack vs Heap memory']
      },
      {
        id: 'oop',
        title: 'OOP (Object-Oriented Programming)',
        description: 'Classes, objects, constructors, encapsulation, getters/setters, and package structures.',
        category: 'Paradigm Basics',
        order: 2,
        prerequisites: ['fundamentals'],
        subtopics: ['Classes and Objects', 'Constructors and this keyword', 'Encapsulation and Access Modifiers', 'Static vs Instance Members']
      },
      {
        id: 'inheritance',
        title: 'Inheritance',
        description: 'Class hierarchies, super keyword, method overriding, IS-A relationships, and protected access.',
        category: 'OOP Principles',
        order: 3,
        prerequisites: ['oop'],
        subtopics: ['Single and Multilevel Inheritance', 'super keyword usage', 'Method Overriding vs Overloading', 'Covariant return types', 'Preventing inheritance with final']
      },
      {
        id: 'polymorphism',
        title: 'Polymorphism',
        description: 'Compile-time vs runtime polymorphism, dynamic method dispatch, upcasting, downcasting, and instanceof.',
        category: 'OOP Principles',
        order: 4,
        prerequisites: ['inheritance'],
        subtopics: ['Compile-time polymorphism', 'Dynamic Method Dispatch', 'Upcasting and Downcasting', 'instanceof operator']
      },
      {
        id: 'abstraction',
        title: 'Abstraction',
        description: 'Abstract classes, abstract methods, design contracts, and partial implementation hierarchies.',
        category: 'Architecture',
        order: 5,
        prerequisites: ['inheritance'],
        subtopics: ['Abstract Class syntax', 'Abstract vs Concrete methods', 'Designing Template Method patterns']
      },
      {
        id: 'interfaces',
        title: 'Interfaces',
        description: 'Pure abstractions, multiple inheritance simulation, default and static methods, and functional interfaces.',
        category: 'Architecture',
        order: 6,
        prerequisites: ['abstraction'],
        subtopics: ['Interface declaration and implementation', 'Multiple interface implementation', 'Default & static interface methods', 'Marker interfaces']
      },
      {
        id: 'exception-handling',
        title: 'Exception Handling',
        description: 'Checked vs unchecked exceptions, try-catch-finally, try-with-resources, custom exceptions, and propagation.',
        category: 'Reliability',
        order: 7,
        prerequisites: ['oop'],
        subtopics: ['Throwable Hierarchy', 'Checked vs Unchecked exceptions', 'try-catch-finally blocks', 'try-with-resources (AutoCloseable)', 'Custom Exception classes']
      },
      {
        id: 'collections',
        title: 'Collections Framework',
        description: 'List, Set, Map hierarchies, Generics, ArrayList, HashSet, HashMap, iterators, and Big-O efficiency.',
        category: 'Data Structures',
        order: 8,
        prerequisites: ['interfaces'],
        subtopics: ['List (ArrayList, LinkedList)', 'Set (HashSet, TreeSet)', 'Map (HashMap, TreeMap)', 'Iterators and Comparable/Comparator', 'Generics syntax']
      },
      {
        id: 'file-handling',
        title: 'File Handling & I/O',
        description: 'Character and byte streams, File, Path, Scanner, BufferedReader, Serialization, and NIO.2.',
        category: 'System I/O',
        order: 9,
        prerequisites: ['exception-handling'],
        subtopics: ['File and Path APIs', 'FileReader / FileWriter / BufferedReader', 'Object Streams & Serialization', 'NIO Files utility']
      },
      {
        id: 'multithreading',
        title: 'Multithreading & Concurrency',
        description: 'Thread lifecycle, Runnable, synchronized blocks, locks, deadlock avoidance, and ExecutorService.',
        category: 'Concurrent Computing',
        order: 10,
        prerequisites: ['oop'],
        subtopics: ['Thread class vs Runnable interface', 'Thread states and lifecycle', 'Synchronization & race conditions', 'Volatile and Atomic variables', 'ExecutorService basics']
      },
      {
        id: 'jdbc',
        title: 'JDBC (Database Connectivity)',
        description: 'Relational database drivers, Connection, Statement, PreparedStatement, ResultSet, and transaction management.',
        category: 'Enterprise Integration',
        order: 11,
        prerequisites: ['exception-handling', 'collections'],
        subtopics: ['JDBC Architecture & Drivers', 'DriverManager & Connection', 'PreparedStatement for SQL injection safety', 'ResultSet traversal', 'Commit & Rollback transactions']
      }
    ]
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    code: 'CS204',
    tagline: 'Linear & Non-Linear Data Organization, Complexities & Algorithmic Problem Solving',
    description: 'Master foundational and advanced data structures: linked lists, stacks, queues, trees, binary search trees, heaps, hash tables, graphs, and algorithmic complexity.',
    level: 'Comprehensive (Core University Course)',
    icon: 'Binary',
    totalTopics: 8,
    estimatedHours: 40,
    topics: [
      {
        id: 'arrays-linked-lists',
        title: 'Arrays & Linked Lists',
        description: 'Static and dynamic arrays, singly linked lists, doubly linked lists, circular lists, pointer manipulation, and memory locality.',
        category: 'Linear Structures',
        order: 1,
        prerequisites: [],
        subtopics: ['Dynamic Array resizing', 'Singly Linked List insertion & deletion', 'Doubly Linked Lists', 'Reversing a Linked List', 'Cycle detection (Floyd’s algorithm)']
      },
      {
        id: 'stacks-queues',
        title: 'Stacks & Queues',
        description: 'LIFO and FIFO data organizations, push/pop/peek operations, queue varieties (circular, double-ended, priority), and recursion call stack.',
        category: 'Linear Structures',
        order: 2,
        prerequisites: ['arrays-linked-lists'],
        subtopics: ['Stack via array vs linked list', 'Queue via circular array', 'Balanced parentheses evaluation', 'Infix to Postfix conversion', 'Monotonic Stacks']
      },
      {
        id: 'trees-bst',
        title: 'Binary Trees & BST',
        description: 'Hierarchical node representations, tree traversals (Inorder, Preorder, Postorder, Level-order), BST search/insert/delete, and height balance.',
        category: 'Non-Linear Structures',
        order: 3,
        prerequisites: ['stacks-queues'],
        subtopics: ['Tree Traversals (DFS & BFS)', 'Binary Search Tree invariants', 'Insertion & Deletion in BST', 'Lowest Common Ancestor (LCA)', 'AVL & Red-Black Tree concepts']
      },
      {
        id: 'heaps-priority-queues',
        title: 'Heaps & Priority Queues',
        description: 'Binary min/max heaps, array representation of complete binary trees, heapify operation, and priority scheduling.',
        category: 'Non-Linear Structures',
        order: 4,
        prerequisites: ['trees-bst'],
        subtopics: ['Max-Heap and Min-Heap properties', 'Heapify and buildHeap in O(N)', 'Heap Sort', 'Priority Queue implementations']
      },
      {
        id: 'hashing',
        title: 'Hashing & Hash Tables',
        description: 'Hash functions, collision resolution techniques (chaining vs open addressing), load factor, dynamic rehashing, and amortized O(1) performance.',
        category: 'Associative Structures',
        order: 5,
        prerequisites: ['arrays-linked-lists'],
        subtopics: ['Hash functions and distribution', 'Collision resolution by chaining', 'Open addressing (Linear & Quadratic probing)', 'Load factor and rehashing', 'HashSet and HashMap internals']
      },
      {
        id: 'graphs',
        title: 'Graphs & Graph Algorithms',
        description: 'Graph representations (Adjacency Matrix vs Adjacency List), Breadth-First Search (BFS), Depth-First Search (DFS), topological sort, and shortest paths.',
        category: 'Non-Linear Structures',
        order: 6,
        prerequisites: ['stacks-queues', 'trees-bst'],
        subtopics: ['Adjacency Matrix vs Adjacency List', 'BFS traversal and shortest path in unweighted graph', 'DFS and cycle detection in directed/undirected graphs', 'Topological Sort (Kahn’s algorithm)', 'Dijkstra’s Algorithm']
      },
      {
        id: 'sorting-searching',
        title: 'Sorting & Searching Algorithms',
        description: 'Divide-and-conquer algorithms (Merge Sort, Quick Sort), comparison sorts, binary search variants, and asymptotic bounds.',
        category: 'Algorithms',
        order: 7,
        prerequisites: ['arrays-linked-lists'],
        subtopics: ['Binary Search and edge conditions', 'Merge Sort (divide-and-conquer)', 'Quick Sort and partitioning schemes', 'Time and Space complexity trade-offs']
      },
      {
        id: 'dynamic-programming',
        title: 'Dynamic Programming Fundamentals',
        description: 'Overlapping subproblems, optimal substructure, memoization (top-down) vs tabulation (bottom-up), and state transition equations.',
        category: 'Algorithms',
        order: 8,
        prerequisites: ['stacks-queues'],
        subtopics: ['Memoization vs Tabulation', '0/1 Knapsack problem', 'Longest Common Subsequence (LCS)', 'State transitions & space optimization']
      }
    ]
  },
  {
    id: 'python-programming',
    title: 'Python for Problem Solving',
    code: 'CS202',
    tagline: 'Algorithmic Thinking & Pythonic Software Patterns',
    description: 'Master Python idioms, list comprehensions, OOP in Python, generators, data manipulation, and algorithmic efficiency.',
    level: 'Intermediate',
    icon: 'Terminal',
    totalTopics: 7,
    estimatedHours: 35,
    topics: [
      {
        id: 'py-basics',
        title: 'Python Core & Data Types',
        description: 'Dynamic typing, slicing, dicts, sets, tuples, list comprehensions, and memory references.',
        category: 'Core Language',
        order: 1,
        prerequisites: [],
        subtopics: ['Slicing and indexing', 'Dictionaries and Sets', 'List comprehensions', 'Unpacking']
      },
      {
        id: 'py-data-structures',
        title: 'Python Built-in Data Structures',
        description: 'Deep dive into lists, dictionaries, tuples, sets, collections module (deque, defaultdict, Counter), and time complexities.',
        category: 'Core Data Structures',
        order: 2,
        prerequisites: ['py-basics'],
        subtopics: ['collections.deque & Counter', 'defaultdict & OrderedDict', 'Set operations and lookups', 'List slicing and memory']
      },
      {
        id: 'py-oop',
        title: 'Object-Oriented Python',
        description: 'Classes, dunder methods (__init__, __repr__), inheritance, properties, and encapsulation.',
        category: 'OOP Principles',
        order: 3,
        prerequisites: ['py-basics'],
        subtopics: ['dunder methods', 'inheritance & super()', '@property decorator', 'Class vs static methods']
      },
      {
        id: 'py-generators',
        title: 'Iterators & Generators',
        description: 'Iterables, iterator protocol, yield keyword, generator expressions, and memory optimization.',
        category: 'Advanced Idioms',
        order: 4,
        prerequisites: ['py-basics'],
        subtopics: ['__iter__ and __next__', 'yield and stateful generators', 'Lazy evaluation']
      },
      {
        id: 'py-file-io',
        title: 'File Handling & Exception Management',
        description: 'Context managers (with statement), file I/O operations, custom exceptions, and robust error handling.',
        category: 'Systems & I/O',
        order: 5,
        prerequisites: ['py-basics'],
        subtopics: ['Context managers & with statement', 'JSON and CSV processing', 'Custom exception hierarchies', 'try/except/else/finally']
      },
      {
        id: 'py-algorithms',
        title: 'Algorithmic Problem Solving with Python',
        description: 'Recursion, two-pointer approach, sliding window, and Pythonic algorithmic implementations.',
        category: 'Algorithms',
        order: 6,
        prerequisites: ['py-data-structures'],
        subtopics: ['Two-pointer techniques', 'Sliding window patterns', 'Memoization with functools.lru_cache', 'Sorting and bisect module']
      }
    ]
  },
  {
    id: 'web-development',
    title: 'Web Development',
    code: 'CS205',
    tagline: 'Modern Frontend, HTML5, CSS3, JavaScript, & Web APIs',
    description: 'Master semantic HTML5, modern responsive CSS with Flexbox & Grid, core JavaScript programming, asynchronous APIs, and component architecture.',
    level: 'Beginner to Intermediate',
    icon: 'Globe',
    totalTopics: 6,
    estimatedHours: 36,
    topics: [
      {
        id: 'html-fundamentals',
        title: 'HTML5 & Semantic Markup',
        description: 'Document structure, semantic HTML5 tags, accessibility standards (WCAG/ARIA), and forms.',
        category: 'Document Structure',
        order: 1,
        prerequisites: [],
        subtopics: ['Semantic Elements', 'Form Controls and Validation', 'Audio & Video Elements', 'Accessibility (a11y) basics']
      },
      {
        id: 'css-modern',
        title: 'Modern CSS, Flexbox & Grid',
        description: 'CSS box model, specificity, responsive design with media queries, Flexbox layouts, and CSS Grid systems.',
        category: 'Styling & Layout',
        order: 2,
        prerequisites: ['html-fundamentals'],
        subtopics: ['Box Model & Cascade', 'Flexbox Alignment & Directions', 'CSS Grid Template Areas', 'Responsive Breakpoints']
      },
      {
        id: 'js-core',
        title: 'JavaScript Core & DOM Manipulation',
        description: 'Variables, scope, closures, event handling, and dynamic DOM manipulation.',
        category: 'Client Scripting',
        order: 3,
        prerequisites: ['html-fundamentals'],
        subtopics: ['DOM Querying & Mutation', 'Event Bubbling & Delegation', 'Closures & Scope', 'Array Methods (map, filter, reduce)']
      },
      {
        id: 'js-async',
        title: 'Asynchronous JavaScript & Fetch API',
        description: 'Event loop, callbacks, Promises, async/await syntax, and REST API consumption.',
        category: 'Asynchronous Programming',
        order: 4,
        prerequisites: ['js-core'],
        subtopics: ['Event Loop & Microtask Queue', 'Promise Chains & Error Handling', 'Fetch API & JSON Parsing', 'async/await patterns']
      },
      {
        id: 'web-apis',
        title: 'Web Storage & Browser APIs',
        description: 'localStorage, sessionStorage, cookies, Geolocation, and browser developer tools debugging.',
        category: 'Browser Platform',
        order: 5,
        prerequisites: ['js-core'],
        subtopics: ['localStorage & sessionStorage', 'Browser DevTools Network & Console', 'History API', 'Handling Cookies']
      },
      {
        id: 'frontend-architecture',
        title: 'Component Architecture & Tooling',
        description: 'Modern component-based design, state management principles, modular CSS, and build tooling.',
        category: 'Modern Web Architecture',
        order: 6,
        prerequisites: ['js-async', 'css-modern'],
        subtopics: ['Component Lifecycles', 'State vs Props', 'Modular CSS / Tailwind', 'Build Bundlers & Vite']
      }
    ]
  }
];

export function getCourseById(courseId: string): Course | undefined {
  if (!courseId) return undefined;
  const lower = courseId.toLowerCase().trim().replace(/_/g, '-');
  if (lower === 'java' || lower === 'java-programming' || lower === 'cs201') {
    return COURSES.find(c => c.id === 'java-programming');
  }
  if (lower === 'data-structures' || lower === 'data structures' || lower === 'datastructures' || lower === 'ds' || lower === 'cs204') {
    return COURSES.find(c => c.id === 'data-structures');
  }
  if (lower === 'python' || lower === 'python-programming' || lower === 'python-data-structures' || lower === 'cs202') {
    return COURSES.find(c => c.id === 'python-programming') || COURSES.find(c => c.id === 'python-data-structures');
  }
  if (lower === 'web-development' || lower === 'web-dev' || lower === 'web' || lower === 'cs205') {
    return COURSES.find(c => c.id === 'web-development');
  }
  return COURSES.find(c => c.id === courseId) || COURSES.find(c => c.title.toLowerCase() === lower);
}

export function getTopicById(courseId: string, topicId: string): Topic | undefined {
  const course = getCourseById(courseId);
  return course?.topics.find(t => t.id === topicId || t.title.toLowerCase() === topicId.toLowerCase());
}
