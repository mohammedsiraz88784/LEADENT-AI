export interface WaitingGameActivity {
  id: string;
  courseId?: string; // 'java-programming' | 'dsa' | 'dbms' | 'web-dev' | 'all'
  topicKeyword?: string;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'guess_concept' | 'quick_trace';
  question: string;
  codeSnippet?: string;
  options?: string[]; // for MCQ or Fill choices
  correctAnswer: string | number; // index or string
  explanation: string;
}

export const WAITING_LEARNING_ACTIVITIES: WaitingGameActivity[] = [
  // --- JAVA PROGRAMMING ---
  {
    id: 'java_inh_1',
    courseId: 'java-programming',
    topicKeyword: 'inheritance',
    type: 'mcq',
    question: 'Which keyword is commonly used to inherit a class in Java?',
    options: ['implements', 'extends', 'inherits', 'parent'],
    correctAnswer: 1, // 'extends'
    explanation: 'In Java, the "extends" keyword creates a subclass from a superclass. "implements" is used for interfaces.'
  },
  {
    id: 'java_inh_2',
    courseId: 'java-programming',
    topicKeyword: 'inheritance',
    type: 'true_false',
    question: 'Does Java support multiple inheritance of classes (e.g. class C extends A, B)?',
    options: ['True', 'False'],
    correctAnswer: 1, // False
    explanation: 'Java does not allow multiple class inheritance to avoid the diamond problem, but permits implementing multiple interfaces.'
  },
  {
    id: 'java_poly_1',
    courseId: 'java-programming',
    topicKeyword: 'polymorphism',
    type: 'mcq',
    question: 'Method overriding in Java is an example of which type of polymorphism?',
    options: ['Compile-time Polymorphism', 'Runtime / Dynamic Polymorphism', 'Ad-hoc Polymorphism', 'Parametric Polymorphism'],
    correctAnswer: 1,
    explanation: 'Method overriding resolves dynamically at runtime based on the actual object instance (Runtime Polymorphism).'
  },
  {
    id: 'java_abs_1',
    courseId: 'java-programming',
    topicKeyword: 'abstraction',
    type: 'guess_concept',
    question: 'Which OOP concept focuses on hiding internal complexity and exposing only necessary features?',
    options: ['Abstraction', 'Encapsulation', 'Polymorphism', 'Composition'],
    correctAnswer: 0,
    explanation: 'Data Abstraction isolates essential interface features from intricate implementation mechanics.'
  },
  {
    id: 'java_trace_1',
    courseId: 'java-programming',
    topicKeyword: 'fundamentals',
    type: 'quick_trace',
    question: 'What is the output of this Java statement?',
    codeSnippet: 'System.out.println(10 + 20 + "Java" + 5 + 5);',
    options: ['30Java55', '30Java10', '1020Java55', 'Compilation Error'],
    correctAnswer: 0,
    explanation: 'Left-to-right evaluation: (10 + 20) -> 30, then 30 + "Java" -> "30Java", then string concatenation for "30Java55".'
  },
  {
    id: 'java_inter_1',
    courseId: 'java-programming',
    topicKeyword: 'interfaces',
    type: 'true_false',
    question: 'Can a class implement multiple interfaces in Java?',
    options: ['True', 'False'],
    correctAnswer: 0, // True
    explanation: 'Yes, a Java class can implement multiple interfaces separated by commas: `class Dog implements Pet, Animal`.'
  },
  {
    id: 'java_coll_1',
    courseId: 'java-programming',
    topicKeyword: 'collections',
    type: 'mcq',
    question: 'Which Java Collection does NOT allow duplicate elements?',
    options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'],
    correctAnswer: 2,
    explanation: 'Set collections (such as HashSet and TreeSet) enforce uniqueness and do not allow duplicate items.'
  },

  // --- DATA STRUCTURES & ALGORITHMS (DSA) ---
  {
    id: 'dsa_tree_1',
    courseId: 'dsa',
    topicKeyword: 'trees',
    type: 'mcq',
    question: 'What is the average time complexity for searching in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    explanation: 'Searching a balanced BST halves the search space at each level, taking O(log n) time.'
  },
  {
    id: 'dsa_stack_1',
    courseId: 'dsa',
    topicKeyword: 'stacks',
    type: 'guess_concept',
    question: 'Which Data Structure operates on the LIFO (Last-In, First-Out) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Heap'],
    correctAnswer: 1,
    explanation: 'A Stack processes the most recently pushed item first (LIFO order).'
  },
  {
    id: 'dsa_sort_1',
    courseId: 'dsa',
    topicKeyword: 'sorting',
    type: 'mcq',
    question: 'Which sorting algorithm has a worst-case time complexity of O(n log n)?',
    options: ['QuickSort', 'MergeSort', 'BubbleSort', 'InsertionSort'],
    correctAnswer: 1,
    explanation: 'MergeSort always divides into halves and merges in O(n log n) even in the worst case.'
  },
  {
    id: 'dsa_graph_1',
    courseId: 'dsa',
    topicKeyword: 'graphs',
    type: 'true_false',
    question: 'Does Breadth-First Search (BFS) use a Queue data structure to explore nodes level-by-level?',
    options: ['True', 'False'],
    correctAnswer: 0,
    explanation: 'BFS uses a FIFO queue to visit all neighbors at the present depth before moving deeper.'
  },

  // --- DBMS ---
  {
    id: 'dbms_acid_1',
    courseId: 'dbms',
    topicKeyword: 'transactions',
    type: 'mcq',
    question: 'In ACID properties, what does "I" stand for?',
    options: ['Integrity', 'Isolation', 'Index', 'Idempotence'],
    correctAnswer: 1,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability in database transactions.'
  },
  {
    id: 'dbms_key_1',
    courseId: 'dbms',
    topicKeyword: 'keys',
    type: 'true_false',
    question: 'Can a PRIMARY KEY column in a relational table contain NULL values?',
    options: ['True', 'False'],
    correctAnswer: 1,
    explanation: 'A PRIMARY KEY must uniquely identify each record and therefore cannot contain NULL values.'
  },
  {
    id: 'dbms_sql_1',
    courseId: 'dbms',
    topicKeyword: 'sql',
    type: 'mcq',
    question: 'Which SQL clause is used to filter groups created by the GROUP BY statement?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctAnswer: 1,
    explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.'
  },

  // --- WEB DEVELOPMENT ---
  {
    id: 'web_dom_1',
    courseId: 'web-dev',
    topicKeyword: 'javascript',
    type: 'mcq',
    question: 'In JavaScript, what will `typeof NaN` evaluate to?',
    options: ['"undefined"', '"number"', '"NaN"', '"object"'],
    correctAnswer: 1,
    explanation: 'In JavaScript standard specification, `NaN` (Not-a-Number) is of numeric type ("number").'
  },
  {
    id: 'web_css_1',
    courseId: 'web-dev',
    topicKeyword: 'css',
    type: 'guess_concept',
    question: 'Which CSS layout model provides 2-dimensional grid-based alignment (both rows and columns)?',
    options: ['Flexbox', 'CSS Grid', 'Float Layout', 'Inline Block'],
    correctAnswer: 1,
    explanation: 'CSS Grid is designed for 2D layouts (rows and columns), while Flexbox is primarily 1D.'
  },

  // --- COMPUTER SCIENCE GENERAL / CS FUNDAMENTALS ---
  {
    id: 'cs_gen_1',
    courseId: 'all',
    type: 'mcq',
    question: 'How many bits are in one byte?',
    options: ['4 bits', '8 bits', '16 bits', '32 bits'],
    correctAnswer: 1,
    explanation: '1 Byte is standardly composed of 8 binary digits (bits).'
  },
  {
    id: 'cs_gen_2',
    courseId: 'all',
    type: 'true_false',
    question: 'Does an interpreted language convert source code to machine code line-by-line during execution?',
    options: ['True', 'False'],
    correctAnswer: 0,
    explanation: 'Interpreters execute instructions directly from source code or bytecode line-by-line at runtime.'
  }
];

export function getWaitingGame(courseId?: string, topic?: string): WaitingGameActivity {
  const normalizedCourse = (courseId || '').toLowerCase();
  const normalizedTopic = (topic || '').toLowerCase();

  // 1. Try to find match for both course and topic keyword
  let candidates = WAITING_LEARNING_ACTIVITIES.filter(g => {
    if (g.courseId === 'all') return false;
    const courseMatch = g.courseId && normalizedCourse.includes(g.courseId);
    const topicMatch = g.topicKeyword && normalizedTopic.includes(g.topicKeyword);
    return courseMatch && topicMatch;
  });

  // 2. If no topic match, match by course
  if (candidates.length === 0) {
    candidates = WAITING_LEARNING_ACTIVITIES.filter(g => {
      return g.courseId && (normalizedCourse.includes(g.courseId) || (g.courseId === 'java-programming' && normalizedCourse.includes('java')));
    });
  }

  // 3. Fallback to all activities
  if (candidates.length === 0) {
    candidates = WAITING_LEARNING_ACTIVITIES;
  }

  // Pick random candidate
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
