import { StudentTutorContext, TutorEvaluation, TutorMode } from '../src/types';

export interface TutorKnowledgeEntry {
  topicId: string;
  topicTitle: string;
  modes: {
    explain: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
    simplify: {
      text: string;
      suggestedQuestions: string[];
    };
    example: {
      text: string;
      codeSnippet: string;
      suggestedQuestions: string[];
    };
    analogy: {
      text: string;
      suggestedQuestions: string[];
    };
    hint: {
      text: string;
      suggestedQuestions: string[];
    };
    practice: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
    test: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
    explain_mistake: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
    application: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
    challenge: {
      text: string;
      codeSnippet?: string;
      suggestedQuestions: string[];
    };
  };
}

export const TUTOR_TOPIC_KNOWLEDGE: Record<string, TutorKnowledgeEntry> = {
  inheritance: {
    topicId: 'inheritance',
    topicTitle: 'Inheritance & super Keyword',
    modes: {
      explain: {
        text: `### Understanding Java Inheritance & the \`super\` Keyword

In Java, **Inheritance** is a foundational Object-Oriented mechanism allowing a subclass to derive state (fields) and behaviors (methods) from an existing superclass using the \`extends\` keyword.

#### 1. The \`IS-A\` Relationship
Inheritance models an **IS-A** relationship (e.g., a \`SavingsAccount\` *is a* \`BankAccount\`; a \`Manager\` *is an* \`Employee\`). It forms an architectural hierarchy with \`java.lang.Object\` at the very root.

#### 2. The \`super\` Keyword Mechanics
* **Constructor Delegation (\`super(...)\`)**: A subclass constructor *must* invoke a superclass constructor. If not explicitly specified with \`super(...)\`, the Java compiler automatically inserts an implicit call to the parent's no-argument constructor (\`super();\`).
* **First Statement Constraint**: If you explicitly call \`super(...)\` or \`this(...)\`, it **must be the absolute first statement** in the constructor body. This guarantees that parent state is initialized before child state is established.
* **Overridden Method Calling (\`super.methodName()\`)**: Allows a derived class to reuse and extend the parent's business logic rather than duplicating it.

#### 3. Method Overriding Rules
* Must have the identical method signature (name and parameter list).
* Return type must be identical or a subtype (**covariant return type**).
* Access modifier cannot be more restrictive (e.g., you cannot override a \`public\` parent method as \`protected\` or \`private\`).
* Always annotate with \`@Override\` to trigger compile-time validation.`,
        codeSnippet: `class BankAccount {
    protected String accountNumber;
    protected double balance;

    public BankAccount(String accountNumber, double balance) {
        this.accountNumber = accountNumber;
        this.balance = balance;
    }

    public double calculateMonthlyFee() {
        return 5.00; // Base flat maintenance fee
    }
}

class PremiumSavingsAccount extends BankAccount {
    private double interestRate;

    public PremiumSavingsAccount(String accNo, double balance, double interestRate) {
        super(accNo, balance); // MUST be the first statement
        this.interestRate = interestRate;
    }

    @Override
    public double calculateMonthlyFee() {
        // Waive monthly fee if balance exceeds $10,000; otherwise base fee
        return balance >= 10000 ? 0.0 : super.calculateMonthlyFee();
    }
}`,
        suggestedQuestions: [
          'Why must super() be the first statement in a constructor?',
          'What happens if the parent class has no default constructor?',
          'Give me a quick 1-minute quiz on Inheritance'
        ]
      },
      simplify: {
        text: `### Inheritance in Plain Language: The "Family Blueprint"

Think of Inheritance like **reusing an existing master recipe or architectural blueprint**:

1. **The Base Blueprint (Parent/Superclass)**: Imagine you have a blueprint for a standard house with 4 walls, a roof, a front door, and plumbing.
2. **The Custom Blueprint (Child/Subclass)**: Instead of redrawing the house blueprint from scratch, you take the standard house blueprint and say: *"I want everything this standard house has, plus a 2nd-floor balcony and a solar roof."*
3. **What is \`super\`?**:
   Before you can paint the walls of your new 2nd-floor balcony, the foundation and 1st floor of the house must already be poured! That's why \`super()\` calls the parent constructor **first**—to build the base house before customizing the additions.

In short:
* **Child class inherits** all non-private features.
* **Child class can override** methods to behave differently.
* **\`super\` lets the child access** the parent's original parts.`,
        suggestedQuestions: [
          'Show me a simple code example using Vehicle and Car',
          'What is the difference between overriding and overloading?',
          'Test my understanding with a practice problem'
        ]
      },
      example: {
        text: `Here is a clean, practical Java implementation of an Employee & Manager hierarchy demonstrating constructor chaining with \`super()\` and polymorphic method overriding:`,
        codeSnippet: `public class Employee {
    protected String name;
    protected double baseSalary;

    public Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    public double getMonthlyEarnings() {
        return this.baseSalary;
    }

    public void displaySummary() {
        System.out.println(name + " earns $" + getMonthlyEarnings() + "/mo");
    }
}

public class Manager extends Employee {
    private double quarterlyBonus;

    public Manager(String name, double baseSalary, double quarterlyBonus) {
        super(name, baseSalary); // Parent state initialized first
        this.quarterlyBonus = quarterlyBonus;
    }

    @Override
    public double getMonthlyEarnings() {
        // Reuses base salary from parent and adds prorated monthly bonus
        return super.getMonthlyEarnings() + (quarterlyBonus / 3.0);
    }
}

// Client Verification Code:
public class Main {
    public static void main(String[] args) {
        Employee dev = new Employee("Alice", 8000.0);
        Employee lead = new Manager("Bob", 10000.0, 6000.0); // Polymorphic reference

        dev.displaySummary();  // Alice earns $8000.0/mo
        lead.displaySummary(); // Bob earns $12000.0/mo (Dynamic dispatch!)
    }
}`,
        suggestedQuestions: [
          'Can you explain how lead.displaySummary() called Manager.getMonthlyEarnings()?',
          'What happens if I remove super(name, baseSalary)?',
          'Give me a coding challenge to write right now'
        ]
      },
      analogy: {
        text: `### Real-World Analogy: The Smartphone Operating System Upgrade

Imagine **Android 14 (Parent)** and a customized manufacturer build like **Samsung One UI (Child)**:

1. **Inheritance**: Samsung doesn't write a mobile OS from zero. They inherit the core Linux kernel, memory manager, and cellular connectivity from Android.
2. **Method Overriding**: When you tap the "Share" button, Samsung *overrides* standard Android behavior to display Quick Share at the top.
3. **The \`super\` Keyword**: When Samsung's customized camera app takes a photo, it might apply special face-beautification filters, but it delegates the actual RAW sensor reading to \`super.captureFrame()\`.
4. **Why \`super()\` comes first**: You cannot load your custom lockscreen widgets before the base Android operating system has booted into memory!`,
        suggestedQuestions: [
          'How does this relate to Java constructors?',
          'Can a child class remove a feature from a parent?',
          'Test my understanding of Inheritance'
        ]
      },
      hint: {
        text: `### Socratic Hint for Inheritance & Constructors

When thinking about constructor execution and \`super()\`, ask yourself:

1. **State Ownership**: Who owns the private and protected fields declared in the superclass? The superclass constructor!
2. **Order of Construction**: Can a child class safely use or modify parent fields before the parent constructor has had a chance to initialize them?
3. **Default Behavior**: If you do not write \`super(...)\`, what default constructor does Java look for in the parent class?

Think through what happens if the parent class has *only* a parameterized constructor like \`public Vehicle(String vin)\` and no zero-argument constructor.`,
        suggestedQuestions: [
          'What error does the compiler give if parent has no no-arg constructor?',
          'Give me an example showing this error and how to fix it',
          'Explain why constructors are not inherited in Java'
        ]
      },
      practice: {
        text: `### Inheritance Tracing Challenge

Trace the execution of this Java program and determine the exact output printed to the console:

\`\`\`java
class Alpha {
    public Alpha() {
        System.out.print("A ");
    }
    public void execute() {
        System.out.print("AlphaExec ");
    }
}

class Beta extends Alpha {
    public Beta() {
        System.out.print("B ");
    }
    @Override
    public void execute() {
        super.execute();
        System.out.print("BetaExec ");
    }
}

public class Test {
    public static void main(String[] args) {
        Alpha obj = new Beta();
        obj.execute();
    }
}
\`\`\`

**Question:** What is the exact sequence printed by \`new Beta()\` followed by \`obj.execute()\`?
Type your answer below!`,
        suggestedQuestions: [
          'My answer is: A B AlphaExec BetaExec',
          'Why does Alpha constructor run before Beta?',
          'What would happen if Beta called this() instead?'
        ]
      },
      test: {
        text: `### Diagnostic Check: Inheritance Mastery

Please answer this question to check your understanding:

**Scenario:**
Consider this code:
\`\`\`java
class Device {
    private String serialNumber;
    public Device(String serialNumber) {
        this.serialNumber = serialNumber;
    }
}

class Phone extends Device {
    private double screenSize;
    public Phone(double screenSize) {
        this.screenSize = screenSize;
    }
}
\`\`\`

1. Will the \`Phone\` class compile as written? If not, what exact compilation error occurs and why?
2. How should the \`Phone\` constructor be rewritten to fix the issue?

*Type your answer and I will evaluate your reasoning!*`,
        suggestedQuestions: [
          'It will fail because Phone implicitly calls super() but Device has no no-arg constructor.',
          'Phone must take serialNumber and call super(serialNumber) first.',
          'Show me the full corrected Phone class'
        ]
      },
      explain_mistake: {
        text: `### Top 3 Mistakes Students Make in Java Inheritance

#### Mistake 1: Forgetting that Constructors are NOT Inherited
Constructors are specialized initializers, not members of a class. Subclasses do not inherit parent constructors; they must declare their own constructors and chain to the parent via \`super(...)\`.

#### Mistake 2: Missing the Implicit \`super()\` Trap
When you write:
\`\`\`java
class Child extends Parent {
    public Child() {
        // Java secretly inserts: super();
    }
}
\`\`\`
If \`Parent\` defined a custom constructor like \`public Parent(int id)\`, Java **no longer provides the default empty constructor**. As a result, the invisible \`super();\` triggers:
\`Implicit super constructor Parent() is undefined for default constructor\`.

#### Mistake 3: Attempting to Override \`private\` or \`static\` Methods
* \`private\` methods are not visible in subclasses, so writing a method with the same name in the child is merely creating a brand new unrelated method, not overriding.
* \`static\` methods belong to the class, not the instance. Declaring the same signature in a subclass is **Method Hiding**, not method overriding (dynamic dispatch won't work on static methods).`,
        suggestedQuestions: [
          'Can you show an example of static method hiding vs overriding?',
          'What is the difference between super and this?',
          'Give me a practice problem on constructor chaining'
        ]
      },
      application: {
        text: `### Enterprise Architecture Application: Payment Gateway Processing

In enterprise e-commerce systems (like Stripe or PayPal integrations), inheritance is used to enforce baseline transaction lifecycles, auditing, and idempotency guarantees:

\`\`\`java
public abstract class PaymentProcessor {
    protected final String merchantId;
    protected final AuditLogger auditLogger;

    public PaymentProcessor(String merchantId, AuditLogger logger) {
        this.merchantId = merchantId;
        this.auditLogger = logger;
    }

    // Template Method Pattern: Defines the immutable transaction skeleton
    public final PaymentResult processPayment(PaymentRequest request) {
        auditLogger.logAttempt(request.getTransactionId());
        validateCurrency(request.getCurrency());
        
        // Polymorphic delegation to specific payment network
        PaymentResult result = executeTransaction(request);
        
        auditLogger.logOutcome(request.getTransactionId(), result.isSuccess());
        return result;
    }

    protected abstract PaymentResult executeTransaction(PaymentRequest request);
    
    protected void validateCurrency(String currency) {
        if (!"USD".equals(currency) && !"EUR".equals(currency)) {
            throw new UnsupportedCurrencyException(currency);
        }
    }
}

public class CreditCardProcessor extends PaymentProcessor {
    private final EncryptionService encryptionService;

    public CreditCardProcessor(String merchantId, AuditLogger logger, EncryptionService enc) {
        super(merchantId, logger); // Enforce base audit wiring
        this.encryptionService = enc;
    }

    @Override
    protected PaymentResult executeTransaction(PaymentRequest request) {
        String token = encryptionService.tokenize(request.getCardNumber());
        return NetworkGateway.charge(token, request.getAmount());
    }
}
\`\`\``,
        suggestedQuestions: [
          'Why is processPayment marked final?',
          'How does this guarantee that audit logs are never bypassed?',
          'What is the Template Method pattern in Java?'
        ]
      },
      challenge: {
        text: `### Advanced Challenge: Polymorphic Field Resolution vs Dynamic Dispatch

Predict what this code prints and explain the JVM mechanism behind the result:

\`\`\`java
class Base {
    public String name = "BaseField";
    public String getName() {
        return "BaseMethod";
    }
}

class Sub extends Base {
    public String name = "SubField";
    @Override
    public String getName() {
        return "SubMethod";
    }
}

public class Puzzle {
    public static void main(String[] args) {
        Base ref = new Sub();
        System.out.println(ref.name + " | " + ref.getName());
    }
}
\`\`\`

**Question:** What does \`ref.name\` evaluate to, and what does \`ref.getName()\` evaluate to? Why do fields and methods behave differently?`,
        suggestedQuestions: [
          'My answer: BaseField | SubMethod',
          'Explain why fields are not polymorphic in Java',
          'How does the JVM invoke methods using vtables?'
        ]
      }
    }
  },

  polymorphism: {
    topicId: 'polymorphism',
    topicTitle: 'Polymorphism & Dynamic Dispatch',
    modes: {
      explain: {
        text: `### Polymorphism & Dynamic Method Dispatch in Java

**Polymorphism** (Greek: "many forms") allows a single interface or reference type to represent entities of different underlying classes.

#### 1. Compile-Time vs Runtime Polymorphism
* **Compile-Time (Static Binding)**: Method Overloading (\`print(int)\`, \`print(String)\`). The compiler binds the call based on argument types.
* **Runtime (Dynamic Binding)**: Method Overriding. The Java Virtual Machine determines the actual method implementation at runtime based on the **underlying object instance**, not the reference type.

#### 2. How the JVM Resolves Virtual Methods (The vtable)
When you call \`animal.makeSound()\`, where \`Animal animal = new Dog();\`:
1. The compiler verifies that \`Animal\` declares \`makeSound()\`.
2. At runtime, the JVM inspects the object's class header pointer in the heap.
3. It looks up \`Dog\`'s virtual method table (**vtable**) and executes \`Dog.makeSound()\`.
4. This bytecode instruction is \`invokevirtual\`.`,
        codeSnippet: `List<Shape> shapes = new ArrayList<>();
shapes.add(new Circle(5.0));
shapes.add(new Rectangle(4.0, 6.0));

// One unified loop, multiple specialized implementations executed at runtime:
for (Shape shape : shapes) {
    System.out.println("Area: " + shape.calculateArea());
}`,
        suggestedQuestions: [
          'How does the JVM vtable work under the hood?',
          'What is the difference between upcasting and downcasting?',
          'Give me a polymorphism practice challenge'
        ]
      },
      simplify: {
        text: `### Polymorphism Simplified: The Universal Remote Control

Think of a **Universal TV Remote Control**:
* The remote has a **Power Button** (The reference type / contract).
* If you point it at a Sony TV and press Power, the Sony screen lights up.
* If you point it at an LG Projector and press Power, the LG fan turns on and projects an image.

You don't need a different finger or a different brain to press Power. You send the same message (\`turnOn()\`), and the **receiver device decides how to react**. That is runtime polymorphism in Java!`,
        suggestedQuestions: [
          'Show me how to code the remote control example in Java',
          'What is instanceof and when should I use it?',
          'Test my understanding of polymorphism'
        ]
      },
      example: {
        text: `Here is a complete polymorphic notification pipeline:`,
        codeSnippet: `interface Notifier {
    void sendNotification(String message, String recipient);
}

class EmailNotifier implements Notifier {
    @Override
    public void sendNotification(String message, String recipient) {
        System.out.println("Connecting to SMTP server... Sending Email to " + recipient + ": " + message);
    }
}

class SmsNotifier implements Notifier {
    @Override
    public void sendNotification(String message, String recipient) {
        System.out.println("Dispatching SMS via Twilio API to " + recipient + ": " + message);
    }
}

public class NotificationService {
    // Loosely coupled: works with ANY Notifier implementation without code changes
    public void broadcastAlert(List<Notifier> channels, String alert, String user) {
        for (Notifier channel : channels) {
            channel.sendNotification(alert, user); // Dynamic dispatch
        }
    }
}`,
        suggestedQuestions: [
          'Why is programming to an interface better than concrete classes?',
          'How do I safely downcast if I need SMS-specific settings?',
          'Give me a practice question'
        ]
      },
      analogy: {
        text: `### Analogy: A Music Conductor & Diverse Musicians

Imagine an orchestra conductor who simply raises their baton and signals: *"Play the note C at forte."*
* The violinist draws a horsehair bow across steel strings.
* The flutist blows air over an embouchure hole.
* The trumpeter buzzes their lips into a brass mouthpiece.

The conductor doesn't need to know individual finger positions or lung physics for every instrument. The conductor speaks to the universal concept of **Musician**, and each instrument resolves the note through its own physical mechanism!`,
        suggestedQuestions: [
          'Show this in Java code with Musician and playNote()',
          'What happens if an instrument does not implement playNote()?',
          'Test my understanding'
        ]
      },
      hint: {
        text: `When analyzing polymorphism in Java, always distinguish between the **Reference Type** (the variable's declared type on the left) and the **Object Type** (the actual class instantiated with \`new\` on the right):
* The **Reference Type** dictates what methods the compiler allows you to call.
* The **Object Type** dictates which version of the method is executed by the JVM at runtime.`,
        suggestedQuestions: [
          'Can you show a code snippet where compiler blocks a method call?',
          'How does downcasting work with instanceof?',
          'Give me a practice problem'
        ]
      },
      practice: {
        text: `### Polymorphism Code Prediction

Consider these classes:
\`\`\`java
class Parent {
    public void show() { System.out.print("Parent "); }
}
class Child extends Parent {
    @Override
    public void show() { System.out.print("Child "); }
    public void extra() { System.out.print("Extra "); }
}

public class Runner {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();
        // Line X: p.extra();
    }
}
\`\`\`

1. What is printed by \`p.show()\`?
2. What happens if you uncomment Line X (\`p.extra()\`)? Explain why.`,
        suggestedQuestions: [
          'p.show() prints Child, Line X fails compilation because extra() is not on Parent.',
          'How do I fix Line X safely?',
          'Explain why the compiler rejects p.extra()'
        ]
      },
      test: {
        text: `### Test: Dynamic Dispatch vs Overloading

Given:
\`\`\`java
class A {
    public void test(Object obj) { System.out.print("A-Obj "); }
    public void test(String str) { System.out.print("A-Str "); }
}

class B extends A {
    @Override
    public void test(Object obj) { System.out.print("B-Obj "); }
}

public class DispatchCheck {
    public static void main(String[] args) {
        A ref = new B();
        Object o = "hello";
        ref.test(o);
        ref.test("world");
    }
}
\`\`\`

**Question:** What does \`ref.test(o)\` print, and what does \`ref.test("world")\` print?
*Submit your answer and I will evaluate your reasoning!*`,
        suggestedQuestions: [
          'My answer is: B-Obj A-Str',
          'Why does test(o) call B-Obj instead of A-Str?',
          'Explain compile-time overload resolution vs runtime dispatch'
        ]
      },
      explain_mistake: {
        text: `### Common Mistake: Confusing Reference Type with Instance Type

Students often write:
\`\`\`java
Animal a = new Dog();
a.bark(); // Compile Error: Cannot find symbol method bark() in Animal!
\`\`\`
Even though the memory object in the heap is genuinely a \`Dog\`, the compiler only looks at the type of the variable (\`Animal\`). Since \`Animal\` has no \`bark()\` method, compilation fails!

**Fix:**
Use pattern matching for \`instanceof\` (Java 16+):
\`\`\`java
if (a instanceof Dog d) {
    d.bark(); // Safe and compiler-approved!
}
\`\`\``,
        suggestedQuestions: [
          'What is the Java 16 instanceof pattern matching syntax?',
          'What happens if I cast without checking instanceof?',
          'Give me a practice exercise'
        ]
      },
      application: {
        text: `### Enterprise Application: Database Connection Pooling & JDBC

In Spring Boot and enterprise Java, database access is completely polymorphic:
\`\`\`java
// The client code only imports java.sql.Connection and javax.sql.DataSource:
public class OrderRepository {
    private final DataSource dataSource;

    public OrderRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void persist(Order order) throws SQLException {
        // At runtime, dataSource could be HikariCP, Tomcat Pool, or AWS Aurora Pool.
        // connection could be PostgreSQLConnection or OracleConnection:
        try (Connection conn = dataSource.getConnection()) {
            PreparedStatement stmt = conn.prepareStatement("INSERT INTO orders...");
            stmt.executeUpdate();
        }
    }
}
\`\`\`
Your business logic never imports vendor-specific code (\`PgConnection\`). If your company moves from Postgres to Oracle, zero lines of business logic change.`,
        suggestedQuestions: [
          'How does Dependency Injection use polymorphism?',
          'What is try-with-resources in this example?',
          'Give me a coding challenge'
        ]
      },
      challenge: {
        text: `### Polymorphic Design Challenge: The Strategy Pattern

Design a clean, open-for-extension \`DiscountEngine\` that calculates checkout discounts for three customer tiers:
1. \`RegularCustomer\` (0% discount)
2. \`PremiumCustomer\` (10% discount on orders over $50)
3. \`VipCustomer\` (20% discount + free $5 voucher)

**Constraint:** You are strictly forbidden from using any \`if (customerType == ...)\` or \`switch\` statements. Use polymorphism and an interface instead!`,
        suggestedQuestions: [
          'Show me how to define DiscountStrategy interface',
          'How does the Context class delegate to the Strategy?',
          'Give me starter code to implement this'
        ]
      }
    }
  },

  interfaces: {
    topicId: 'interfaces',
    topicTitle: 'Interfaces & Abstraction Contracts',
    modes: {
      explain: {
        text: `### Java Interfaces & Multiple Contract Fulfillment

An **interface** in Java is a 100% abstract contract specifying what a class must do, without mandating how it is implemented.

#### Key Rules:
1. **Multiple Inheritance of Type**: Java does not allow multiple class inheritance (\`class C extends A, B\` is forbidden to prevent the Diamond Problem). However, a class can implement **multiple interfaces** (\`class C implements A, B\`).
2. **Implicit Modifiers**:
   * All fields are implicitly \`public static final\` (constants).
   * All method headers are implicitly \`public abstract\` (unless declared \`default\` or \`static\`).
3. **Default Methods (Java 8+)**: Allow adding new methods to interfaces with a default implementation without breaking existing implementing classes.
4. **Functional Interfaces**: Interfaces with exactly one abstract method (annotated with \`@FunctionalInterface\`), enabling Java Lambda expressions (\`Runnable\`, \`Comparable\`, \`Consumer\`).`,
        codeSnippet: `public interface Auditable {
    String getAuditId();
    
    // Default method providing fallback implementation:
    default void logAuditEntry() {
        System.out.println("AUDIT [" + java.time.Instant.now() + "]: " + getAuditId());
    }
}`,
        suggestedQuestions: [
          'How does Java resolve conflicts when two interfaces have the same default method?',
          'What is the difference between an abstract class and an interface?',
          'Give me a quick 1-minute quiz on interfaces'
        ]
      },
      simplify: {
        text: `### Interfaces in Simple Terms: The Universal Electrical Plug

Think of an interface like a **standard electrical wall outlet (3-prong socket)**:
* The wall outlet does not care whether you plug in a refrigerator, a laptop charger, or a vacuum cleaner.
* It only cares that your plug has **the 3 prongs in the exact right shape** (the method contract).
* A device can fulfill multiple contracts: your laptop is \`Rechargeable\` (plug), \`Portable\` (has a handle), and \`WiFiConnected\` (antenna).

In Java:
* An **Abstract Class** is what an object *IS* (A \`Dog\` is an \`Animal\`).
* An **Interface** is what an object *CAN DO* (A \`Dog\` is \`Trainable\` and \`PetFriendly\`).`,
        suggestedQuestions: [
          'When should I choose an abstract class vs an interface?',
          'Show me a code example with multiple interfaces',
          'Test my understanding'
        ]
      },
      example: {
        text: `Here is a practical Java example of a class implementing multiple interfaces:`,
        codeSnippet: `interface Printable {
    void print();
}

interface Exportable {
    byte[] exportPdf();
}

public class FinancialReport implements Printable, Exportable {
    private String reportData;

    public FinancialReport(String data) {
        this.reportData = data;
    }

    @Override
    public void print() {
        System.out.println("Sending to hardware printer: " + reportData);
    }

    @Override
    public byte[] exportPdf() {
        return reportData.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}`,
        suggestedQuestions: [
          'Can an interface extend another interface?',
          'What is a marker interface like Serializable?',
          'Give me a practice exercise'
        ]
      },
      analogy: {
        text: `### Analogy: Employment Contracts & Freelancers

A company hires a developer under a **Contractor Interface**:
* The contract specifies: \`deliverCode()\`, \`attendSprintMeeting()\`, \`submitInvoice()\`.
* The company doesn't care how the contractor lives, what food they eat, or what hobbies they have (their internal class state).
* The contractor can hold contracts with multiple clients simultaneously (\`implements ClientA, ClientB\`), whereas they can only have one legal identity (\`extends Human\`).`,
        suggestedQuestions: [
          'How does this prevent tight coupling in software?',
          'What is the Dependency Inversion Principle?',
          'Test my understanding'
        ]
      },
      hint: {
        text: `Remember that interfaces define *behavior contracts*. If two classes share code implementation and internal mutable state, an abstract class or composition is preferred. If classes in unrelated hierarchies share capabilities, an interface is ideal.`,
        suggestedQuestions: [
          'Can an interface have a private method?',
          'How do default methods work in Java 8+?',
          'Give me a practice question'
        ]
      },
      practice: {
        text: `### Interface Diamond Conflict Question

What happens in this scenario?
\`\`\`java
interface Left {
    default void execute() { System.out.print("Left"); }
}

interface Right {
    default void execute() { System.out.print("Right"); }
}

class Center implements Left, Right {
    // What code must be written here for Center to compile?
}
\`\`\`
How does the programmer explicitly resolve which \`execute()\` is invoked?`,
        suggestedQuestions: [
          'Center must override execute() and call Left.super.execute() or Right.super.execute()',
          'Why does Java require explicit resolution here?',
          'Show me the exact code syntax'
        ]
      },
      test: {
        text: `### Test: Interface Design & Rules

Answer these 2 questions:
1. Why are all fields inside an interface automatically \`static\` and \`final\`?
2. Why can't you instantiate an interface directly with \`new MyInterface()\`?

*Type your answers and I will evaluate your understanding!*`,
        suggestedQuestions: [
          'Interface has no instance state/constructors so fields must be constant.',
          'Interface methods lack body so instantiation has no executable code.',
          'Give me the full explanation'
        ]
      },
      explain_mistake: {
        text: `### Common Mistake: Forgetting \`public\` Visibility on Interface Methods

In Java interfaces, all abstract methods are implicitly \`public\`. When implementing an interface in a class, forgetting the \`public\` modifier causes:
\`Cannot reduce the visibility of the inherited method from InterfaceName\`.

\`\`\`java
interface Service {
    void run(); // implicitly public
}

class MyService implements Service {
    void run() { } // COMPILE ERROR! Default package visibility is more restrictive than public!
}
\`\`\`
**Fix:** Always write \`public void run()\`.`,
        suggestedQuestions: [
          'Why does Java enforce that implementing methods must be public?',
          'Can an interface method be protected?',
          'Give me a practice exercise'
        ]
      },
      application: {
        text: `### Enterprise Application: Decoupling with Repository Pattern

In microservices, business services depend on interfaces, never on raw databases:
\`\`\`java
public interface UserRepository {
    Optional<User> findById(String id);
    void save(User user);
}

// Production uses Postgres:
@Repository
public class PostgresUserRepository implements UserRepository { ... }

// Unit tests use an in-memory test double:
public class MockUserRepository implements UserRepository { ... }
\`\`\`
This allows test suites to execute in milliseconds without launching a real database.`,
        suggestedQuestions: [
          'How does this enable test-driven development?',
          'What is the difference between a stub and a mock?',
          'Give me a coding challenge'
        ]
      },
      challenge: {
        text: `### Challenge: Functional Interface & Lambda Customization

Create a custom \`@FunctionalInterface\` named \`DataFilter<T>\` with a single method:
\`boolean matches(T item);\`.

Then write a generic static utility method \`filterList(List<T> items, DataFilter<T> filter)\` that returns a new \`List<T>\` containing only items where \`matches\` returns \`true\`. Demonstrate calling it with a lambda expression filtering even numbers!`,
        suggestedQuestions: [
          'Show me starter code for DataFilter',
          'How does @FunctionalInterface protect against errors?',
          'Give me the complete solution'
        ]
      }
    }
  },

  data_abstraction: {
    topicId: 'data_abstraction',
    topicTitle: 'Data Abstraction & Abstract Classes',
    modes: {
      explain: {
        text: `### Understanding Data Abstraction in Object-Oriented Programming

**Data Abstraction** is the foundational software engineering principle of **hiding internal implementation complexities** and exposing only the essential interface necessary for the outside world to interact with an object.

---

#### 1. Core Principle: What vs. How
* **The "What" (Interface)**: The set of operations a component promises to perform.
* **The "How" (Implementation)**: The internal algorithms, data structures, and memory manipulation details that are deliberately concealed.

---

#### 2. Real-World Analogy
* **The ATM or Car Dashboard**: When driving a car, you press the accelerator pedal to speed up and the brake pedal to stop. You do not need to know fuel injection timing, brake fluid pressure, or cylinder combustion mechanics. The dashboard provides a clean, abstract interface.

---

#### 3. Practical Code Example
\`\`\`java
// Abstract Class defining the essential contract
abstract class PaymentProcessor {
    protected String transactionId;

    public PaymentProcessor(String transactionId) {
        this.transactionId = transactionId;
    }

    // Abstract method: sub-classes MUST implement the specific payment gateway
    public abstract boolean processPayment(double amount);

    // Concrete shared method
    public void printReceipt(double amount) {
        System.out.println("Receipt for Tx: " + transactionId + " | Amount: $" + amount);
    }
}

// Concrete Implementation
class CreditCardProcessor extends PaymentProcessor {
    private String cardNumber;

    public CreditCardProcessor(String transactionId, String cardNumber) {
        super(transactionId);
        this.cardNumber = cardNumber;
    }

    @Override
    public boolean processPayment(double amount) {
        // Encapsulated gateway communication & encryption logic
        System.out.println("Connecting to Card Gateway for " + cardNumber.substring(12) + "...");
        return true;
    }
}
\`\`\`

---

#### 4. Key Real-World Applications
* **JDBC Drivers**: You write \`connection.prepareStatement(...)\` without knowing database vendor internals.
* **Java Collections Framework**: You call \`list.add(...)\` or \`map.get(...)\` without managing raw pointers or array resizing.

---

#### 5. Practice Activity
* Try defining an \`abstract class CloudStorageService\` with abstract methods \`uploadFile(String name)\` and \`downloadFile(String name)\`, then create a \`S3StorageService\` subclass!`,
        codeSnippet: `abstract class BankAccount {
    protected double balance;

    public BankAccount(double balance) {
        this.balance = balance;
    }

    public abstract void applyMonthlyFees();

    public double getBalance() {
        return balance;
    }
}`,
        suggestedQuestions: [
          'What is the difference between abstraction and encapsulation?',
          'Can an abstract class have constructors in Java?',
          'When should I use an abstract class vs an interface?'
        ]
      },
      simplify: {
        text: `### Data Abstraction Simplified

Think of **Data Abstraction** as a **TV Remote Control**:
* You press the **Power button** or **Volume Up** button.
* You do NOT need to understand infrared frequencies, circuit boards, or microcontroller logic.
* In Java, you achieve this using **Abstract Classes** and **Interfaces**.`,
        suggestedQuestions: [
          'Show me a simple code example',
          'What is the difference between abstract class and interface?',
          'Give me a real-world quiz question'
        ]
      },
      example: {
        text: `### Practical Example: Data Abstraction with Banking System

Here is how data abstraction separates public operations from private account calculation mechanics:`,
        codeSnippet: `abstract class Account {
    protected String accNumber;
    protected double balance;

    public Account(String accNumber, double balance) {
        this.accNumber = accNumber;
        this.balance = balance;
    }

    // Abstract contract
    public abstract double calculateInterest();

    public void deposit(double amount) {
        if (amount > 0) this.balance += amount;
    }
}

class FixedDepositAccount extends Account {
    private int lockInMonths;

    public FixedDepositAccount(String accNo, double bal, int months) {
        super(accNo, bal);
        this.lockInMonths = months;
    }

    @Override
    public double calculateInterest() {
        return balance * 0.07 * (lockInMonths / 12.0);
    }
}`,
        suggestedQuestions: [
          'Why cannot we instantiate an abstract class directly?',
          'Can abstract classes contain static methods?',
          'Show me interface-based abstraction'
        ]
      },
      analogy: {
        text: `### Real-World Analogy for Data Abstraction

Imagine ordering food at a restaurant:
* **The Menu (Abstract Interface)**: You view dish names and prices and tell the waiter what you want.
* **The Kitchen (Hidden Implementation)**: The chef chops vegetables, manages stoves, and monitors temperatures. You don't need to be in the kitchen to enjoy your meal.

This separation protects client code when internal implementation details change!`,
        suggestedQuestions: [
          'How does this apply to Java APIs?',
          'Give me a code example',
          'What happens if an abstract method is not overridden?'
        ]
      },
      hint: {
        text: `💡 **Guiding Hint on Abstraction:**
* Focus on defining **what** operations must exist using the \`abstract\` keyword before writing any method bodies.
* Abstract classes allow you to share state (fields) and constructor initialization with \`super()\`, while forcing subclasses to provide custom behavior.`,
        suggestedQuestions: [
          'Show me how to declare an abstract class',
          'How does super() work in abstract classes?',
          'Give me a quick practice problem'
        ]
      },
      practice: {
        text: `### Practice Exercise: Data Abstraction

1. Create an abstract class \`NotificationService\` with:
   * \`protected String recipient\`
   * \`public abstract boolean sendNotification(String message)\`
2. Create two subclasses: \`EmailNotification\` and \`SMSNotification\`.
3. Implement the \`sendNotification\` method in each class with appropriate print statements.`,
        suggestedQuestions: [
          'Review my attempt at NotificationService',
          'Show me the solution structure',
          'How do I test this in main()?'
        ]
      },
      test: {
        text: `### Quick Knowledge Check: Data Abstraction

**Question:** Which of the following is true regarding \`abstract\` classes in Java?
A) An abstract class must contain at least one abstract method.
B) An abstract class cannot have constructors.
C) An abstract class can have concrete methods, instance variables, and constructors.
D) You can instantiate an abstract class directly using \`new\`.

*Reply with your answer and rationale!*`,
        suggestedQuestions: [
          'My answer is C',
          'Explain why abstract classes have constructors',
          'Can an abstract class be declared final?'
        ]
      },
      explain_mistake: {
        text: `### Common Mistakes in Data Abstraction:
1. **Confusing Abstraction with Encapsulation**: Encapsulation is data bundling and hiding variables with \`private\` + getters/setters. Abstraction is hiding implementation complexity with abstract classes/interfaces.
2. **Attempting \`new AbstractClass()\`**: Abstract classes cannot be instantiated directly; they must be extended by a concrete subclass.
3. **Forgetting to override all abstract methods**: A non-abstract subclass must provide implementations for *every* inherited abstract method.`,
        suggestedQuestions: [
          'Show me an example of the compilation error',
          'How to fix subclass overriding errors?',
          'Explain abstract vs interface'
        ]
      },
      application: {
        text: `### Industrial Applications of Data Abstraction
* **Operating System Drivers**: File system APIs (\`open\`, \`read\`, \`write\`) abstract SSD, HDD, and network storage differences.
* **Microservices**: REST APIs and gRPC contracts define the abstract communication endpoints while backend services scale independently.`,
        suggestedQuestions: [
          'How does Spring Boot utilize abstraction?',
          'Show me abstract factory design pattern',
          'Give me a coding challenge'
        ]
      },
      challenge: {
        text: `### Coding Challenge: Shape Rendering Pipeline
Implement an abstract class \`Shape\` with abstract methods \`double calculateArea()\` and \`double calculatePerimeter()\`. Then create \`Circle\`, \`Rectangle\`, and \`Triangle\` subclasses that properly implement these methods.`,
        suggestedQuestions: [
          'Give me starter code for Shape',
          'Show me the Triangle area calculation formula',
          'Review my code'
        ]
      }
    }
  },

  stack: {
    topicId: 'stack',
    topicTitle: 'Stack Data Structure & LIFO Mechanics',
    modes: {
      explain: {
        text: `### Stack Data Structure & LIFO Mechanics

A **Stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. The element inserted last is the first one to be removed.

---

#### 1. Fundamental Operations
* **\`push(item)\`**: Adds an element to the top of the stack — **$O(1)$**
* **\`pop()\`**: Removes and returns the top element — **$O(1)$**
* **\`peek()\` / \`top()\`**: Returns the top element without removing it — **$O(1)$**
* **\`isEmpty()\`**: Checks if the stack has zero elements — **$O(1)$**

---

#### 2. Real-World Analogies
* **Stack of Plates / Cafeteria Tray Dispenser**: You place new plates on top, and you take plates from the top.
* **Browser Back Button & Undo (Ctrl+Z)**: Every page you visit is pushed onto the navigation stack; clicking "Back" pops the current URL.

---

#### 3. Practical Java Implementation
\`\`\`java
import java.util.EmptyStackException;

public class ArrayStack<T> {
    private Object[] elements;
    private int top;
    private static final int DEFAULT_CAPACITY = 10;

    public ArrayStack() {
        elements = new Object[DEFAULT_CAPACITY];
        top = -1;
    }

    public void push(T item) {
        if (top == elements.length - 1) {
            resize();
        }
        elements[++top] = item;
    }

    @SuppressWarnings("unchecked")
    public T pop() {
        if (isEmpty()) throw new EmptyStackException();
        T item = (T) elements[top];
        elements[top--] = null; // Prevent memory leak
        return item;
    }

    @SuppressWarnings("unchecked")
    public T peek() {
        if (isEmpty()) throw new EmptyStackException();
        return (T) elements[top];
    }

    public boolean isEmpty() {
        return top == -1;
    }

    private void resize() {
        Object[] newArr = new Object[elements.length * 2];
        System.arraycopy(elements, 0, newArr, 0, elements.length);
        elements = newArr;
    }
}
\`\`\`

---

#### 4. Key Computer Science Applications
* **JVM Call Stack**: Tracks method execution frames and local variables.
* **Expression Evaluation & Syntax Parsing**: Checking balanced parentheses \`({[]})\` in compilers and math parsing (Infix to Postfix).
* **Backtracking Algorithms**: Depth-First Search (DFS), maze solving.`,
        codeSnippet: `import java.util.Stack;

public class BalancedParentheses {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
        suggestedQuestions: [
          'How does Java ArrayDeque compare to Stack class?',
          'How do compilers use stacks for recursion?',
          'Show me how to solve balanced parentheses problem'
        ]
      },
      simplify: {
        text: `### Stack Simplified
A **Stack** is like a **stack of pancakes**:
* You put new pancakes on top (**Push**).
* You eat pancakes from the top (**Pop**).
* You check what's on top (**Peek**).
* Rule: **Last pancake on top is the First pancake you eat (LIFO)**.`,
        suggestedQuestions: [
          'Show me push and pop with simple code',
          'Where is stack used in everyday programming?',
          'What happens if you pop an empty stack?'
        ]
      },
      example: {
        text: `### Practical Example: Balanced Parentheses Checker using Stack`,
        codeSnippet: `public static boolean isBalanced(String expr) {
    java.util.ArrayDeque<Character> stack = new java.util.ArrayDeque<>();
    for (char ch : expr.toCharArray()) {
        if (ch == '(' || ch == '{' || ch == '[') {
            stack.push(ch);
        } else if (ch == ')' || ch == '}' || ch == ']') {
            if (stack.isEmpty()) return false;
            char open = stack.pop();
            if ((ch == ')' && open != '(') ||
                (ch == '}' && open != '{') ||
                (ch == ']' && open != '[')) return false;
        }
    }
    return stack.isEmpty();
}`,
        suggestedQuestions: [
          'Trace this code with string "{[()]}"',
          'Why is ArrayDeque preferred over java.util.Stack?',
          'How to implement Min Stack with O(1) getMin()?'
        ]
      },
      analogy: {
        text: `### Analogy: Tennis Ball Container
Think of a cylindrical tennis ball can:
1. To insert a ball, you push it into the top.
2. The first ball you put in ends up at the very bottom.
3. When you open the can, the only ball you can reach is the one inserted last.
That is **LIFO (Last In, First Out)**!`,
        suggestedQuestions: [
          'How is this different from a Queue?',
          'Give me a code example',
          'How does call stack use this analogy?'
        ]
      },
      hint: {
        text: `💡 **Stack Pro Tip:**
* Stacks provide instant $O(1)$ access only to the top element.
* Whenever a problem requires matching opposite pairs (like opening/closing tags, undo/redo, or reversing sequence), a Stack is almost always the optimal data structure!`,
        suggestedQuestions: [
          'Show me how to reverse a string using Stack',
          'What is Stack Overflow Error in Java?',
          'How to implement a stack with two queues?'
        ]
      },
      practice: {
        text: `### Practice Challenge: Reverse a String using Stack
Write a method \`String reverseString(String input)\` that pushes every character of \`input\` onto a Stack, then pops them one by one to construct and return the reversed string.`,
        suggestedQuestions: [
          'Review my solution for string reversal',
          'What is the time and space complexity?',
          'Show me the complete code'
        ]
      },
      test: {
        text: `### Quick Knowledge Check: Stacks
**Question:** If the sequence of operations is \`push(10)\`, \`push(20)\`, \`pop()\`, \`push(30)\`, \`peek()\`, what is returned by the final \`peek()\`?
A) 10
B) 20
C) 30
D) EmptyStackException`,
        suggestedQuestions: [
          'My answer is C (30)',
          'Explain the trace step by step',
          'Give me another question'
        ]
      },
      explain_mistake: {
        text: `### Common Mistakes with Stacks:
1. **Calling \`pop()\` or \`peek()\` on an empty stack**: Always check \`!stack.isEmpty()\` first to prevent \`EmptyStackException\`.
2. **Using legacy \`java.util.Stack\` in high-throughput apps**: The legacy \`Stack\` class extends \`Vector\` and synchronizes every method, creating thread overhead. Prefer \`ArrayDeque<T>\` for single-threaded stacks.`,
        suggestedQuestions: [
          'Why did Sun Microsystems make Stack extend Vector?',
          'Show me ArrayDeque stack usage',
          'How to implement stack using linked list?'
        ]
      },
      application: {
        text: `### Industrial Applications of Stacks:
* **Text Editors**: Implementing multi-level Undo/Redo stacks.
* **Browser History**: Storing previous page tokens in mobile & web navigation.
* **Compiler Syntax Trees**: Checking arithmetic precedence and AST generation.`,
        suggestedQuestions: [
          'How does Infix to Postfix conversion work?',
          'Show me Dijkstra Two-Stack algorithm',
          'Give me a practice problem'
        ]
      },
      challenge: {
        text: `### Coding Challenge: Min Stack
Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the minimum element (\`getMin\`) in **$O(1)$ constant time**.`,
        suggestedQuestions: [
          'Give me a hint for Min Stack',
          'Show me the two-stack approach',
          'Review my Min Stack implementation'
        ]
      }
    }
  },

  dbms_normalization: {
    topicId: 'dbms_normalization',
    topicTitle: 'DBMS Normalization (1NF, 2NF, 3NF & BCNF)',
    modes: {
      explain: {
        text: `### DBMS Normalization (1NF, 2NF, 3NF & BCNF) Explained

**Database Normalization** is the systematic technique of organizing relational database tables to **minimize data redundancy** and prevent **anomalies** (insertion, update, and deletion anomalies) while preserving data integrity.

---

#### 1. Why Normalization Matters (The 3 Anomalies)
* **Insertion Anomaly**: Inability to record certain facts without adding unrelated data (e.g., cannot add a new course until a student enrolls).
* **Update Anomaly**: Changing a student's address requires updating multiple duplicate rows; if one row is missed, data becomes inconsistent.
* **Deletion Anomaly**: Deleting the only student enrolled in a course unintentionally deletes the course information from the database.

---

#### 2. Normal Forms Step-by-Step

| Normal Form | Rule Requirement | Elimination Target |
| :--- | :--- | :--- |
| **1NF (First Normal Form)** | Every column must contain **atomic (indivisible) values**; no repeating groups or comma-separated lists. | Multi-valued attributes |
| **2NF (Second Normal Form)** | Must be in **1NF** + **No Partial Dependency** (all non-key attributes must depend on the *entire* candidate key, not just a subset). | Partial dependencies on composite keys |
| **3NF (Third Normal Form)** | Must be in **2NF** + **No Transitive Dependency** ($X \\to Y$ and $Y \\to Z$ where $Z$ depends on non-key $Y$). | Transitive dependencies |
| **BCNF (Boyce-Codd Normal Form)** | For every functional dependency $X \\to Y$, $X$ **must be a super key**. | Non-trivial functional dependencies on non-superkeys |

---

#### 3. Practical Example

##### Un-Normalized Student Table:
\`\`\`sql
-- Problem: Multi-valued courses (Violates 1NF)
StudentID | StudentName | CoursesEnrolled
101       | Alex        | Java, DBMS, Networks
\`\`\`

##### Step 1: Convert to 1NF (Atomic rows)
\`\`\`sql
StudentID | CourseID | StudentName | ProfessorName | ProfOffice
101       | CS201    | Alex        | Dr. Smith      | Room 402
101       | CS301    | Alex        | Dr. Adams      | Room 510
\`\`\`
*(Candidate Key: Composite \`{StudentID, CourseID}\`)*

##### Step 2: Convert to 2NF (Remove Partial Dependencies)
* Notice \`StudentName\` depends only on \`StudentID\`, not \`CourseID\`.
* Decompose into:
  1. \`Students(StudentID, StudentName)\`
  2. \`StudentCourses(StudentID, CourseID)\`
  3. \`Courses(CourseID, ProfessorName, ProfOffice)\`

##### Step 3: Convert to 3NF (Remove Transitive Dependencies)
* In \`Courses\`, \`ProfOffice\` depends on \`ProfessorName\`, which is not a candidate key.
* Decompose into:
  1. \`Courses(CourseID, ProfessorName)\`
  2. \`Professors(ProfessorName, ProfOffice)\`

---

#### 4. Practice Activity
* Given a table \`OrderDetails(OrderID, ItemID, CustomerName, ItemPrice, Quantity)\`, identify which normal form it satisfies and decompose it into 3NF!`,
        suggestedQuestions: [
          'What is the difference between 3NF and BCNF?',
          'Can over-normalization hurt query performance?',
          'What is denormalization and when is it used?'
        ]
      },
      simplify: {
        text: `### Database Normalization in Simple Terms

Normalization is **cleaning up messy spreadsheets into organized linked tables**:
* **1NF**: Every cell has only **ONE** item (no commas like "Java, Python").
* **2NF**: Split tables so details belong to the **whole primary key**, not just half of it.
* **3NF**: Don't store info that can already be figured out from another column (remove chain dependencies).`,
        suggestedQuestions: [
          'Show me a simple student table example',
          'What is an update anomaly?',
          'Give me a 3NF quiz problem'
        ]
      },
      example: {
        text: `### Real-World SQL Normalization Example`,
        codeSnippet: `-- 3NF Normalized Schema
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE
);

CREATE TABLE Courses (
    course_id VARCHAR(10) PRIMARY KEY,
    course_title VARCHAR(100) NOT NULL,
    credits INT NOT NULL
);

CREATE TABLE Enrollments (
    student_id INT,
    course_id VARCHAR(10),
    grade VARCHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);`,
        suggestedQuestions: [
          'Why does Enrollments have a composite primary key?',
          'How do JOIN queries work with this schema?',
          'Explain foreign key constraints'
        ]
      },
      analogy: {
        text: `### Analogy: Contact List vs. Duplicate Paperwork
Imagine writing your friend's home address next to *every single text message* they send you.
* If they move, you would have to edit 1,000 old text messages (**Update anomaly**).
* If you delete their last text, you lose their home address (**Deletion anomaly**).

Normalization means storing their address **once** in your Contact Book, and referencing them by their Name/ID in messages!`,
        suggestedQuestions: [
          'How does this prevent data corruption?',
          'Give me a real-world database design example',
          'What is candidate key vs super key?'
        ]
      },
      hint: {
        text: `💡 **Normalization Rule of Thumb:**
* "Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key, so help me Codd." (Codd's Law for 3NF).`,
        suggestedQuestions: [
          'Explain Codd rule for 3NF',
          'How to find candidate keys from functional dependencies?',
          'Give me a practice problem'
        ]
      },
      practice: {
        text: `### Practice Question: DBMS Normalization
Given relation $R(A, B, C, D)$ with Functional Dependencies:
$A \\to B$, $B \\to C$, $C \\to D$.
1. Find the Candidate Key of $R$.
2. Determine the highest Normal Form of $R$.
3. Decompose $R$ into 3NF.`,
        suggestedQuestions: [
          'Review my attempt for R(A,B,C,D)',
          'Show me step-by-step candidate key finding',
          'What is lossless join decomposition?'
        ]
      },
      test: {
        text: `### Quick Quiz: DBMS Normalization
**Question:** A relation is in 2NF if and only if it is in 1NF and:
A) Every determinant is a candidate key.
B) No non-prime attribute is transitively dependent on candidate keys.
C) No non-prime attribute is partially dependent on any candidate key.
D) All multi-valued attributes are removed.`,
        suggestedQuestions: [
          'My answer is C',
          'Explain what a non-prime attribute means',
          'Give me another quiz question'
        ]
      },
      explain_mistake: {
        text: `### Common Mistakes in DBMS Normalization:
1. **Confusing Prime vs Non-Prime Attributes**: A prime attribute is a member of ANY candidate key. Non-prime attributes are not part of any candidate key.
2. **Thinking 3NF eliminates all redundancy**: 3NF can still have redundancy if multiple overlapping candidate keys exist. BCNF handles those cases!`,
        suggestedQuestions: [
          'Show an example where 3NF fails but BCNF succeeds',
          'How to check dependency preservation?',
          'Explain lossy vs lossless decomposition'
        ]
      },
      application: {
        text: `### Industrial Applications of Database Normalization:
* **Fintech & Banking Systems**: Strict 3NF/BCNF prevents balance mismatch and guarantees ACID transactions.
* **E-Commerce Orders**: Separates Customers, Products, Orders, and PaymentLedger to allow millions of concurrent updates without locking conflicts.`,
        suggestedQuestions: [
          'How do OLAP systems differ from OLTP normalization?',
          'When is Denormalization recommended in microservices?',
          'Show me an e-commerce schema design'
        ]
      },
      challenge: {
        text: `### Schema Design Challenge: Hospital Management System
Design a 3NF schema for a Hospital that records Patients, Doctors, Appointments, Prescriptions, and Medications without any data anomalies.`,
        suggestedQuestions: [
          'Give me starter tables for Hospital schema',
          'Show me foreign key relationships',
          'Review my schema design'
        ]
      }
    }
  },

  binary_search: {
    topicId: 'binary_search',
    topicTitle: 'Binary Search Algorithm & Divide-and-Conquer',
    modes: {
      explain: {
        text: `### Binary Search Algorithm & Divide-and-Conquer

**Binary Search** is an optimal search algorithm that finds the position of a target value within a **sorted array** in **$O(\\log n)$ logarithmic time** by repeatedly dividing the search interval in half.

---

#### 1. Prerequisite Condition
* **The data MUST be sorted** in ascending or descending order.

---

#### 2. Algorithm Execution Steps
1. Maintain two pointers: \`low = 0\` and \`high = array.length - 1\`.
2. Compute the midpoint: \`mid = low + (high - low) / 2\` (avoids integer overflow).
3. If \`array[mid] == target\`: Found! Return \`mid\`.
4. If \`array[mid] < target\`: The target lies in the right half; set \`low = mid + 1\`.
5. If \`array[mid] > target\`: The target lies in the left half; set \`high = mid - 1\`.
6. If \`low > high\`: The target does not exist; return \`-1\`.

---

#### 3. Real-World Analogy
* **Searching a Dictionary or Phone Book**: To find the word "Polymorphism", you don't read page by page from 'A'. You open near the middle ('M'), see that 'P' comes after 'M', and ignore the entire first half!

---

#### 4. Complete Java Implementation
\`\`\`java
public class BinarySearch {
    public static int search(int[] nums, int target) {
        int low = 0;
        int high = nums.length - 1;

        while (low <= high) {
            // Safe midpoint calculation preventing integer overflow
            int mid = low + (high - low) / 2;

            if (nums[mid] == target) {
                return mid; // Target found at index mid
            } else if (nums[mid] < target) {
                low = mid + 1; // Discard left half
            } else {
                high = mid - 1; // Discard right half
            }
        }

        return -1; // Target not found
    }
}
\`\`\`

---

#### 5. Complexity Analysis
* **Time Complexity**: Best: $O(1)$, Average/Worst: $O(\\log n)$. In an array of 1,000,000 elements, it takes at most **20 comparisons**!
* **Space Complexity**: Iterative: $O(1)$ auxiliary space; Recursive: $O(\\log n)$ call stack space.`,
        codeSnippet: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        suggestedQuestions: [
          'Why use low + (high - low) / 2 instead of (low + high) / 2?',
          'How to find the first or last occurrence of a duplicate in binary search?',
          'Explain binary search on answer space'
        ]
      },
      simplify: {
        text: `### Binary Search Simplified
* Guess a number between 1 and 100:
* You guess **50**. I say "Too low".
* Now you only search between **51 and 100**. You eliminated 50 numbers in ONE guess!
* Next guess is **75**.
* That is **Binary Search**: Cutting the problem in half every single step.`,
        suggestedQuestions: [
          'Show me a short Java code snippet',
          'Why must the array be sorted?',
          'How fast is binary search on 1 billion items?'
        ]
      },
      example: {
        text: `### Practical Example: Finding Target in Sorted Array`,
        codeSnippet: `public class Example {
    public static void main(String[] args) {
        int[] sortedData = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };
        int target = 23;
        int resultIndex = BinarySearch.search(sortedData, target);
        System.out.println("Element " + target + " found at index: " + resultIndex); // Output: 5
    }
}`,
        suggestedQuestions: [
          'Trace mid calculations for target 23',
          'What happens if target is 100?',
          'Show me recursive implementation'
        ]
      },
      analogy: {
        text: `### Analogy: Searching a Printed English Dictionary
When you open a 1,000-page dictionary:
* You flip to page 500.
* You see the word starts with 'M'.
* If your word is 'Tree', you throw away pages 1 to 500 and repeat on pages 501 to 1000!
You find any word in ~10 flips.`,
        suggestedQuestions: [
          'Why is O(log n) so powerful?',
          'Show me mathematical proof of O(log n)',
          'Give me a practice exercise'
        ]
      },
      hint: {
        text: `💡 **Binary Search Pro Tip:**
* Remember the loop boundary condition: \`while (low <= high)\`.
* If you write \`while (low < high)\`, you will miss arrays with a single element or targets at the outer edge!`,
        suggestedQuestions: [
          'Explain why (low + high) can overflow in Java',
          'How to implement lower_bound and upper_bound?',
          'Give me a coding challenge'
        ]
      },
      practice: {
        text: `### Practice Exercise: Search Insert Position
Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.
* Must write an algorithm with $O(\\log n)$ runtime complexity!`,
        suggestedQuestions: [
          'Review my solution for Search Insert Position',
          'Show me the solution code',
          'What is the edge case when target is smaller than all elements?'
        ]
      },
      test: {
        text: `### Quick Quiz: Binary Search
**Question:** What is the maximum number of comparisons required to find an element in a sorted array of 1,024 elements using Binary Search?
A) 1024
B) 512
C) 11
D) 10`,
        suggestedQuestions: [
          'My answer is D (10 or 11)',
          'Explain log2(1024)',
          'Give me another question'
        ]
      },
      explain_mistake: {
        text: `### Common Mistakes in Binary Search:
1. **Integer Overflow in Mid Calculation**: \`(low + high) / 2\` can overflow \`Integer.MAX_VALUE\` if \`low + high > 2^31 - 1\`. Always use \`low + (high - low) / 2\`.
2. **Infinite Loops with Mid Pointer**: Setting \`low = mid\` or \`high = mid\` instead of \`mid + 1\` and \`mid - 1\` causes infinite loops when \`high - low == 1\`.`,
        suggestedQuestions: [
          'Show how the famous Java Arrays.binarySearch bug occurred',
          'How to avoid off-by-one errors in binary search?',
          'Explain binary search on rotated sorted array'
        ]
      },
      application: {
        text: `### Industrial Applications of Binary Search:
* **Database Indexing (B+ Trees)**: Locating table records within database disk blocks in logarithmic time.
* **Git Bisect**: Finding the exact commit that introduced a bug in a 10,000-commit repository in just 14 steps!`,
        suggestedQuestions: [
          'How does Git Bisect use binary search?',
          'How does B+ Tree use binary search?',
          'Give me a challenge problem'
        ]
      },
      challenge: {
        text: `### Coding Challenge: Search in Rotated Sorted Array
Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand (e.g., \`[4,5,6,7,0,1,2]\`). Find the index of a given target in $O(\\log n)$ time!`,
        suggestedQuestions: [
          'Give me a hint for rotated sorted array',
          'Show me which half is guaranteed to be sorted',
          'Review my code'
        ]
      }
    }
  }
};

export function evaluateStudentAnswer(

  topic: string,
  studentAnswer: string,
  context: StudentTutorContext
): TutorEvaluation {
  const norm = (studentAnswer || '').toLowerCase();
  
  // Intelligent heuristic academic evaluation based on topic concepts
  let rating: 'Correct' | 'Partially Correct' | 'Needs Review' = 'Partially Correct';
  let whatWasCorrect = '';
  let whatWasMissing = '';
  let whatCouldBeImproved = '';
  let suggestedImprovedUnderstanding = '';

  if (topic.toLowerCase().includes('inherit')) {
    if (norm.includes('super') && (norm.includes('first') || norm.includes('constructor') || norm.includes('compile') || norm.includes('no-arg') || norm.includes('default'))) {
      rating = 'Correct';
      whatWasCorrect = 'You correctly identified that the subclass constructor must invoke the superclass constructor, and recognized the requirement for super() execution.';
      whatWasMissing = 'Ensure you also mention that if super() is not explicitly written, Java attempts an implicit no-argument super() invocation.';
      whatCouldBeImproved = 'Reinforce the memory model: explain that parent fields must be allocated in the heap before child fields are initialized.';
      suggestedImprovedUnderstanding = 'Subclass constructors do not inherit parent constructors; they delegate initialization upward using super(...), which must be the first line.';
    } else {
      rating = 'Needs Review';
      whatWasCorrect = 'You addressed the inheritance relationship between the classes.';
      whatWasMissing = 'You did not emphasize that super() must be the very first statement and that the parent class must possess a compatible constructor.';
      whatCouldBeImproved = 'Focus on the compilation error that occurs when the superclass lacks a zero-argument default constructor.';
      suggestedImprovedUnderstanding = 'When a superclass defines only a parameterized constructor, every subclass constructor must explicitly call super(args) on line 1.';
    }
  } else if (topic.toLowerCase().includes('poly')) {
    if (norm.includes('runtime') || norm.includes('override') || norm.includes('instance') || norm.includes('dispatch') || norm.includes('type') || norm.includes('child')) {
      rating = 'Correct';
      whatWasCorrect = 'You accurately distinguished between reference type (checked at compile-time) and object instance type (dispatched at runtime).';
      whatWasMissing = 'Consider mentioning the JVM vtable (virtual method table) and invokevirtual instruction for deeper academic precision.';
      whatCouldBeImproved = 'Detail why non-virtual methods (private, static, final) cannot undergo dynamic dispatch.';
      suggestedImprovedUnderstanding = 'In Java, the compiler validates calls against the reference type, but the JVM dispatches execution to the actual object type via the vtable at runtime.';
    } else {
      rating = 'Needs Review';
      whatWasCorrect = 'You attempted to trace the method invocation sequence.';
      whatWasMissing = 'Did not clarify that the compiler enforces method existence on the reference variable type.';
      whatCouldBeImproved = 'Practice separating compile-time checking from runtime virtual method execution.';
      suggestedImprovedUnderstanding = 'Polymorphism executes the overridden child method at runtime, but the reference type determines which methods are legally callable.';
    }
  } else {
    rating = 'Partially Correct';
    whatWasCorrect = 'Your response shows an active intuitive understanding of the core programmatic structure.';
    whatWasMissing = 'Be sure to include concrete Java syntax and specify access modifiers or compiler constraints.';
    whatCouldBeImproved = 'Ground your explanation in the LEADENT Practical Route: conceptual model, code example, and edge case handling.';
    suggestedImprovedUnderstanding = `Deepen your grasp of ${topic} by tracing execution steps and identifying compile-time vs runtime guarantees.`;
  }

  return {
    isEvaluation: true,
    rating,
    whatWasCorrect,
    whatWasMissing,
    whatCouldBeImproved,
    suggestedImprovedUnderstanding
  };
}

export function getFallbackTutorResponse(
  context: StudentTutorContext,
  userPrompt: string,
  mode: TutorMode | string = 'explain',
  topicOverride?: string
): {
  text: string;
  mode: TutorMode | string;
  topic: string;
  difficulty: string;
  codeSnippet?: string;
  evaluation?: TutorEvaluation;
  suggestedQuestions: string[];
  isVerifiedConcept: boolean;
} {
  const activeTopic = topicOverride || context.currentTopic || 'Inheritance';
  const normTopic = (activeTopic + ' ' + (userPrompt || '')).toLowerCase();
  
  let key = 'inheritance';
  if (normTopic.includes('abstraction') || normTopic.includes('abstract class')) key = 'data_abstraction';
  else if (normTopic.includes('stack') || normTopic.includes('lifo')) key = 'stack';
  else if (normTopic.includes('dbms') || normTopic.includes('normaliz') || normTopic.includes('1nf') || normTopic.includes('2nf') || normTopic.includes('3nf')) key = 'dbms_normalization';
  else if (normTopic.includes('binary search') || normTopic.includes('search')) key = 'binary_search';
  else if (normTopic.includes('poly') || normTopic.includes('overrid')) key = 'polymorphism';
  else if (normTopic.includes('interf') || normTopic.includes('contract')) key = 'interfaces';

  const entry = (TUTOR_TOPIC_KNOWLEDGE as Record<string, any>)[key] || TUTOR_TOPIC_KNOWLEDGE.data_abstraction || TUTOR_TOPIC_KNOWLEDGE.inheritance;
  
  // Detect if user is answering a question or asking to evaluate
  const promptLower = (userPrompt || '').toLowerCase();
  const isAnswering =
    mode === 'evaluation' ||
    promptLower.startsWith('my answer') ||
    promptLower.includes('i think') ||
    promptLower.includes('answer is') ||
    promptLower.startsWith('a b') ||
    promptLower.includes('evaluat');

  if (isAnswering) {
    const evalData = evaluateStudentAnswer(activeTopic, userPrompt, context);
    const feedbackText = `### Academic Answer Evaluation: ${activeTopic}

**Evaluation Rating:** \`${evalData.rating}\`

* **What was correct:** ${evalData.whatWasCorrect}
* **What was missing:** ${evalData.whatWasMissing}
* **What could be improved:** ${evalData.whatCouldBeImproved}

---

#### Key Takeaway to Solidify:
> ${evalData.suggestedImprovedUnderstanding}

Would you like to try another practice question or test your implementation in the Practice IDE?`;

    return {
      text: feedbackText,
      mode: 'evaluation',
      topic: entry.topicTitle,
      difficulty: context.overallLevel || 'Intermediate',
      evaluation: evalData,
      suggestedQuestions: [
        `Give me another practice question on ${activeTopic}`,
        `Show me a code example in the IDE`,
        `Explain how this is tested in semester exams`
      ],
      isVerifiedConcept: true
    };
  }

  // Selected mode
  let targetMode: string = typeof mode === 'string' && mode ? mode : 'explain';
  if (!entry.modes[targetMode as keyof typeof entry.modes]) {
    targetMode = 'explain';
  }

  const modeContent = (entry.modes[targetMode as keyof typeof entry.modes] || entry.modes.explain) as {
    text: string;
    suggestedQuestions: string[];
    codeSnippet?: string;
  };

  return {
    text: modeContent.text,
    mode: targetMode,
    topic: entry.topicTitle,
    difficulty: context.overallLevel || 'Intermediate',
    codeSnippet: modeContent.codeSnippet,
    suggestedQuestions: modeContent.suggestedQuestions,
    isVerifiedConcept: true
  };
}
