const CourseContent = {
    dashboard: {
        id: "dashboard",
        title: "Welcome",
        kicker: "How to use this web book",
        breadcrumb: ["Welcome"],
        sections: [
            { id: "start", title: "Start", navTitle: "Start" },
            { id: "using-matlab", title: "Using MATLAB-Lite", navTitle: "Using MATLAB-Lite" }
        ],
        matlabBlocks: {
            intro_matrix: "A = [1 2; 3 4]\nB = [10 20; 30 40]\nC = A + B\nwhos"
        },
        html: `
            <section id="start">
                <div class="how-to-card">
                    <h2>Read on the left. Experiment on the right.</h2>
                    <p><strong>LAG2 Interactive Course · v0.1.0</strong></p>
                    <div class="release-links"><a href="https://github.com/asadbek31415-alt/lag2-course/releases/latest/download/LAG2-Interactive-Course.zip" target="_blank" rel="noopener">Computer offline ZIP</a><a href="https://github.com/asadbek31415-alt/lag2-course/releases/latest/download/LAG2-Android.apk" target="_blank" rel="noopener">Android offline app</a><a href="https://github.com/asadbek31415-alt/lag2-course/releases/latest" target="_blank" rel="noopener">Release notes</a></div>
                    <p>Theory, calculations and course animations work offline in the ZIP and Android app. The exam channel and optional YouTube video need internet. On a phone, use the Theory, MATLAB and Nav tabs below.</p>
                    <p>This reference book is for fast review while solving LAG2 exam questions. Read one chapter, try the MATLAB-Lite blocks, then leave this file and solve the matching pinned questions in <a href="https://t.me/Lag2_for_exam" target="_blank" rel="noopener">the exam channel</a>.</p>
                    <p>The left pane is theory. The right pane is a small MATLAB session with a Command Window and Workspace.</p>
                </div>
            </section>

            <section id="using-matlab">
                <h2>Using MATLAB-Lite</h2>
                <p>Press <strong>Load in MATLAB</strong> beside a code block, then press <strong>Run</strong> or <kbd>Enter</kbd>. Use <kbd>Shift</kbd> + <kbd>Enter</kbd> for several commands at once.</p>
                <p>"<code>ans</code>" stores the last unnamed result. A semicolon suppresses printed output but still computes the value. <code>whos</code> lists variables, the Workspace button shows their values, <code>clc</code> clears the Command Window, <code>clearvars</code> clears variables, and <code>clear all</code> resets the session.</p>
                <div class="matlab-block">
                    <pre>A = [1 2; 3 4]
B = [10 20; 30 40]
C = A + B
whos</pre>
                    <div class="block-actions">
                        <button class="load-matlab" data-code-id="intro_matrix">Load in MATLAB</button>
                    </div>
                </div>
            </section>
        `
    },
    chapters: [
        {
            id: "functions",
            title: "Functions and Numerical Errors",
            shortTitle: "Functions",
            kicker: "Chapter 1",
            folder: "1. functions",
            sections: [
                { id: "scientific-computing", title: "Scientific Computing", navTitle: "Scientific Computing" },
                { id: "algorithms", title: "Numerical Problems and Algorithms", navTitle: "Problems and Algorithms" },
                { id: "machine-numbers", title: "Machine Numbers", navTitle: "Machine Numbers" },
                { id: "rounding-error", title: "Rounding Error", navTitle: "Rounding Error" },
                { id: "deep-rounding-error", title: "Deep Dive: Rounding Bounds", parent: "rounding-error", deepDive: true },
                { id: "error-measures", title: "Absolute and Relative Error", navTitle: "Error Measures" },
                { id: "deep-error-measures", title: "Deep Dive: Choosing an Error Measure", parent: "error-measures", deepDive: true },
                { id: "cancellation", title: "Cancellation", navTitle: "Cancellation" },
                { id: "deep-cancellation", title: "Deep Dive: Lost Digits", parent: "cancellation", deepDive: true },
                { id: "conditioning", title: "Conditioning and Stability", navTitle: "Conditioning" },
                { id: "deep-conditioning-stability", title: "Deep Dive: Conditioning vs Stability", parent: "conditioning", deepDive: true },
                { id: "matlab-basics", title: "MATLAB Basics", navTitle: "MATLAB Basics" },
                { id: "deep-matlab-syntax", title: "Deep Dive: MATLAB Syntax Choices", parent: "matlab-basics", deepDive: true },
                { id: "indexing", title: "Indexing and the Colon Operator", navTitle: "Indexing" },
                { id: "deep-indexing", title: "Deep Dive: Indexing Patterns", parent: "indexing", deepDive: true },
                { id: "command-tools", title: "Command Window Tools", navTitle: "Command Tools" }
            ],
            matlabBlocks: {
                algorithm_demo: "a = 3\nb = 4\nc = a^2 + b^2\nsqrt(c)\nname = 10;",
                round_demo: "x = [2.4 2.5 2.6 -2.5]\nround(x)\nfloor(x)\nceil(x)\nfix(x)",
                machine_demo: "format long%to see more digits\na = 0.1 + 0.2\nb = 0.3\na - b\nsmall = 1e-12\nformat short %back to default format",
                error_demo: "true_value = 1000\napprox_value = 999\nabsolute_error = abs(true_value - approx_value)\nrelative_error = absolute_error / abs(true_value)",
                cancel_demo: "format long\na = 1.0000000000000001\nb = 1.0000000000000000\nc = a - b\nformat short",
                cond_demo: "A = [1 1; 1 1.0001]\ncond(A)\nb = [2; 2.0001]\nx = A \\ b",
                matrix_demo: "A = [1 2; 3 4]\nB = [10 0; 0 10]\nA * B\nA .* B",
                transpose_demo: "A = [1 2 3; 4 5 6]\nA'\ntranspose(A)",
                loop_sum_demo: "n = 5;\ns = 0;\nfor i = 1:n\n    s = s + i;\nend\ns\nv = 1:n;\nsum(v)",
                indexing_demo: "A = [10 20 30; 40 50 60; 70 80 90]\nA(1, 2)\nA(:, 2)\nA(2, :)",
                colon_demo: "v = 1:5\nw = 0:0.25:1\nlinspace(0, 1, 5)",
                command_demo: "format long\n1 / 3\nformat short\n1 / 3",
                help_demo: "help clear\nhelp lu\nwhos"
            },
            html: `
                <section id="scientific-computing">
                    <h2>Scientific Computing</h2>
                    <p>Scientific computing is the study of practical numerical methods for mathematical problems that are too large, too repetitive, or too complex to solve by hand. A system with 1000 equations and 1000 unknowns may be conceptually simple, but it needs an algorithm and a computer.</p>
                    <p>In this course, MATLAB is the experimental language. The mathematical question is not only <em>what is the exact answer?</em> but also <em>how do we compute a reliable approximation?</em></p>
                </section>

                <section id="algorithms">
                    <h2>Numerical Problems and Algorithms</h2>
                    <p>A numerical solution is obtained by following a finite sequence of precisely described operations. That sequence is an <strong>algorithm</strong>. For linear algebra, the algorithm matters because different methods may have different accuracy, cost, and sensitivity to rounding error. <strong>Cost</strong> means how much work the computer must do, usually counted by arithmetic operations and memory use.</p>
                    <p>Before the numerical methods start, the goal is to become comfortable with MATLAB syntax. If you know Python or C, variables and arithmetic are familiar, but MATLAB is designed around vectors and matrices.</p>
                    <div class="math-card">
                        <strong>Course theme:</strong> choose the method that gives enough accuracy with the lowest reasonable computational cost.
                    </div>
                    <p>The next block uses assignment, powers, a built-in function, and a semicolon. The semicolon after <code>name = 10;</code> means the variable is created, but it is not printed.</p>
                    <div class="matlab-block">
                        <pre>a = 3
b = 4
c = a^2 + b^2
sqrt(c)
name = 10;</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="algorithm_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>MATLAB syntax is compact: values are assigned by <code>=</code>, exponentiation is <code>^</code>, and built-in functions such as <code>sqrt</code> use parentheses.</p>
                </section>

                <section id="machine-numbers">
                    <h2>Machine Numbers</h2>
                    <p>A computer cannot store every real number. It stores a finite set of <strong>machine numbers</strong>, so many decimals (even simple ones) are rounded before arithmetic even begins.</p>
                    <p>A nonzero floating-point number is stored in the form \\(x=\\pm p\\times N^q\\). Here \\(p\\) is the mantissa, so \\(0.1 \\leq |p| &lt; 1\\), \\(N\\) is the base (10 for decimal, 2 for binary, etc), and \\(q\\) is the integer exponent.</p>
                    <p>Notation like <code>1.2e-12</code> means \\(1.2\\times10^{-12}\\), a very small number. Before running the block, expect <code>0.1 + 0.2</code> and <code>0.3</code> to be mathematically equal, but the stored values may differ by a tiny amount.</p>
                    <div class="matlab-block">
                        <pre>format long %to see more digits
a = 0.1 + 0.2
b = 0.3
a - b
small = 1e-12
format short %back to default format</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="machine_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Machine arithmetic is arithmetic with a fixed number of stored digits. Tiny representation errors are normal.</p>
                </section>

                <section id="rounding-error">
                    <h2>Rounding Error</h2>
                    <p>Rounding error appears when a real number is replaced by a nearby machine number. The error is usually small, but later computations may amplify it.</p>
                    <p>Rounding to nearest even is used for exact halfway cases. The usual school rule always sends .5 upward, which is a little unfair because it creates an upward bias. Round-to-even avoids that: 2.5 rounds to 2, while 3.5 rounds to 4, so the bias is smaller over many computations. MATLAB rounding functions are useful for seeing different rules: <code>round</code> rounds to nearest, <code>floor</code> goes down toward \\(-\\infty\\), <code>ceil</code> goes up toward \\(+\\infty\\), and <code>fix</code> truncates toward 0.</p>
                    <div class="matlab-block">
                        <pre>x = [2.4 2.5 2.6 -2.5]
round(x)
floor(x)
ceil(x)
fix(x)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="round_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>The rounding rule matters. The same real value can move up, down, or toward zero depending on the function or arithmetic model.</p>
                </section>

                <section id="deep-rounding-error" class="deep-dive">
                    <h2>Deep Dive: Rounding Bounds</h2>
                    <p>If \\(a\\) is the exact real value and \\(\\bar a\\) is the stored value, a common model is</p>
                    <p>$$ \\bar a=a(1+\\varepsilon_r). $$</p>
                    <p>The number \\(\\varepsilon_r\\) is the relative rounding error. Machine precision gives an upper bound for the maximum relative rounding error in one rounding step.</p>
                    <p>With base \\(N\\) and \\(t\\) mantissa digits, rounding to nearest gives an error on the order of \\(\\frac{1}{2}N^{-t}\\). For example, with base 10 and 3 mantissa digits, \\(p=0.24619\\) rounds to \\(\\bar p=0.246\\).</p>
                    <p>Rounding error is small locally, but numerical methods must control how it accumulates.</p>
                </section>

                <section id="error-measures">
                    <h2>Absolute and Relative Error</h2>
                    <p>If \\(x\\) is the exact value and \\(\\hat{x}\\) is the computed value, the absolute error is \\(|x-\\hat{x}|\\). The relative error is:</p>
                    <p>$$ \\frac{|x-\\hat{x}|}{|x|} $$</p>
                    <p>Relative error is often more meaningful because it compares the error to the scale of the quantity being computed.</p>
                    <div class="matlab-block">
                        <pre>true_value = 1000
approx_value = 999
absolute_error = abs(true_value - approx_value)
relative_error = absolute_error / abs(true_value)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="error_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Absolute error tells the raw distance. Relative error tells whether that distance is large compared with the true value.</p>
                </section>

                <section id="deep-error-measures" class="deep-dive">
                    <h2>Deep Dive: Choosing an Error Measure</h2>
                    <p>Absolute error is best when the unit matters directly. If a length is wrong by 1 cm, the absolute error is 1 cm.</p>
                    <p>Relative error is best when scale matters. An error of 1 cm is tiny for a long bridge and large for a small component.</p>
                    <p>For vectors, the same idea is written with norms: compare \\(\\|x-\\hat{x}\\|\\) with \\(\\|x\\|\\).</p>
                    <p>Choose the error measure that matches the scale of the question.</p>
                </section>

                <section id="cancellation">
                    <h2>Cancellation</h2>
                    <p>Cancellation occurs when nearly equal numbers are subtracted. Leading digits disappear, and the remaining digits may contain mostly rounding noise. This becomes important in formulas where a small answer is obtained as the difference of two large, close values.</p>
                    <div class="matlab-block">
                        <pre>format long
a = 1.0000000000000001
b = 1.0000000000000000
c = a - b
format short</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="cancel_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Mathematically, the two decimal strings look different. In double precision, however, <code>1.0000000000000001</code> is too close to 1 to be stored as a different number, so MATLAB-Lite stores both as the same machine number and <code>c</code> becomes 0.</p>
                    <p>Cancellation is dangerous because the exact small difference may already be lost before the subtraction is performed.</p>
                </section>

                <section id="deep-cancellation" class="deep-dive">
                    <h2>Deep Dive: Lost Digits</h2>
                    <p>Cancellation is not caused by subtraction alone. It is caused by subtracting close approximations. The shared leading digits disappear, and the result depends on the less reliable trailing digits.</p>
                    <p>This is why two algebraically equivalent formulas can behave differently on a computer. A stable formula avoids subtracting nearly equal quantities when possible.</p>
                    <p>Cancellation is a sign to look for a better computational formula.</p>
                </section>

                <section id="conditioning">
                    <h2>Conditioning and Stability</h2>
                    <p>Conditioning describes the problem itself: do small changes in the input cause small or large changes in the output? Stability describes the algorithm: does the method control the errors introduced during computation?</p>
                    <p>A condition number near 1 is good. A very large condition number is bad because small input errors or rounding errors can be amplified. The example below is chosen because its two rows are almost dependent, so the matrix is close to singular.</p>
                    <div class="matlab-block">
                        <pre>A = [1 1; 1 1.0001]
cond(A)
b = [2; 2.0001]
x = A \\ b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="cond_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>The matrix is almost singular, so solving systems with it is sensitive. This is a property of the problem, not just the code.</p>
                </section>

                <section id="deep-conditioning-stability" class="deep-dive">
                    <h2>Deep Dive: Conditioning vs Stability</h2>
                    <p>The notation \\(\\|A\\|\\) means a <strong>matrix norm</strong>. One useful meaning is the largest possible stretching of a vector by \\(A\\):</p>
                    <p>$$ \\|A\\|=\\max_{x\\ne0}\\frac{\\|Ax\\|}{\\|x\\|}. $$</p>
                    <p>For a linear system, the condition number is</p>
                    <p>$$ \\kappa(A)=\\|A\\|\\,\\|A^{-1}\\|. $$</p>
                    <p>Conditioning belongs to the problem. Stability belongs to the method. A stable method can still produce sensitive answers for an ill-conditioned problem.</p>
                    <p>Always separate "the problem is sensitive" from "the algorithm is unstable."</p>
                </section>

                <section id="matlab-basics">
                    <h2>MATLAB Basics</h2>
                    <p>MATLAB is matrix-first. Spaces or commas separate entries in a row, and semicolons separate rows. A semicolon at the end of a command suppresses output. Commas can separate commands on the same line.</p>
                    <p>Matrix operations and element-wise operations are different. <code>A^2</code>, <code>A*B</code>, and <code>A/B</code> are matrix operations. Dotted forms such as <code>a.^2</code>, <code>a.*b</code>, and <code>a./b</code> apply entry by entry. The example uses a diagonal matrix <code>B</code> so the difference is easy to see.</p>
                    <div class="matlab-block">
                        <pre>A = [1 2; 3 4]
B = [10 0; 0 10]
A * B
A .* B</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="matrix_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Dotted operators such as <code>.*</code>, <code>./</code>, and <code>.^</code> mean element-wise operations.</p>
                    <p>Transpose has two common forms. <code>A'</code> is the short MATLAB notation, and <code>transpose(A)</code> is the function form. They should display the same matrix.</p>
                    <div class="matlab-block">
                        <pre>A = [1 2 3; 4 5 6]
A'
transpose(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="transpose_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Both transpose notations produce the same output style and the same result.</p>
                    <div class="math-card">
                        <strong>MATLAB note:</strong> use <code>for i = 1:n ... end</code> when you need to repeat commands, for example adding <code>1 + 2 + ... + n</code> one term at a time. When one command can work on a whole vector, prefer the vector command.
                    </div>
                    <p>Here the loop version builds the answer step by step. The vector version creates all numbers first and asks MATLAB to add them in one command.</p>
                    <div class="matlab-block">
                        <pre>n = 5;
s = 0;
for i = 1:n
    s = s + i;
end
s
v = 1:n;
sum(v)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="loop_sum_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Both methods give the same number, but the vector command is shorter when the operation naturally applies to the whole list.</p>
                </section>

                <section id="deep-matlab-syntax" class="deep-dive">
                    <h2>Deep Dive: MATLAB Syntax Choices</h2>
                    <p>MATLAB code is often shortest when it works on whole arrays. A loop is useful when each step depends on the previous one, while vector commands are useful when the same operation applies to many entries at once.</p>
                    <p>Use matrix operators when you mean linear algebra. Use dotted operators when you mean entry-by-entry arithmetic.</p>
                    <p>The main syntax habit is deciding whether an operation is matrix-based or element-wise.</p>
                </section>

                <section id="indexing">
                    <h2>Indexing and the Colon Operator</h2>
                    <p>MATLAB uses 1-based indexing. The entry in row <code>i</code>, column <code>j</code> is <code>A(i,j)</code>. The colon <code>:</code> means all indices in that direction.</p>
                    <div class="matlab-block">
                        <pre>A = [10 20 30; 40 50 60; 70 80 90]
A(1, 2)
A(:, 2)
A(2, :)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="indexing_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Indexing is row first, column second. The colon selects all entries in one direction, and <code>end</code> refers to the last valid index.</p>
                    <p>The colon also creates vectors. <code>1:5</code> means start at 1, step by 1, stop at 5. <code>0:0.25:1</code> means start at 0, step by 0.25, stop at 1. <code>linspace(a,b,n)</code> creates <code>n</code> equally spaced values from <code>a</code> to <code>b</code>.</p>
                    <div class="matlab-block">
                        <pre>v = 1:5
w = 0:0.25:1
linspace(0, 1, 5)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="colon_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Use <code>:</code> when the step is important, and <code>linspace</code> when the number of points is important.</p>
                </section>

                <section id="deep-indexing" class="deep-dive">
                    <h2>Deep Dive: Indexing Patterns</h2>
                    <p>MATLAB indexing is row first, column second: <code>A(i,j)</code>. The colon selects all valid indices in one direction, so <code>A(:,j)</code> means the whole column and <code>A(i,:)</code> means the whole row.</p>
                    <p>The keyword <code>end</code> means the last valid index in that position. This is useful for commands such as <code>A(:,end)</code> or <code>A(end,:)</code>.</p>
                    <p>Index vectors can select or reorder entries. For example, <code>A([2 1],:)</code> swaps the first two rows in the displayed result.</p>
                    <p>Indexing is a compact way to select, reorder, or update pieces of arrays.</p>
                </section>

                <section id="command-tools">
                    <h2>Command Window Tools</h2>
                    <p><code>clc</code> clears the Command Window. <code>clearvars</code> clears variables. <code>whos</code> lists the Workspace. <code>format short</code> and <code>format long</code> control display precision. If several commands are run at once, MATLAB prints only commands without a final semicolon. This simulator has a small <code>help</code> command for common topics, but not every MATLAB help page is defined.</p>
                    <div class="matlab-block">
                        <pre>format long
1 / 3
format short
1 / 3</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="command_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <div class="matlab-block">
                        <pre>help clear
help lu
whos</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="help_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

            `
        },
        {
            id: "interpolation",
            title: "Interpolation",
            shortTitle: "Interpolation",
            kicker: "Chapter 2",
            folder: "2. interpolation",
            sections: [
                { id: "approximation-data", title: "Approximation of Functions and Data", navTitle: "Approximation" },
                { id: "polynomial-interpolation", title: "Polynomial Interpolation", navTitle: "Polynomial Interpolation" },
                { id: "polynomial-plotting", title: "Plotting the Polynomial", navTitle: "Plotting" },
                { id: "deep-polynomial-coefficients", title: "Deep Dive: Polynomial Coefficients", parent: "polynomial-interpolation", deepDive: true },
                { id: "lagrange", title: "Lagrange Representation", navTitle: "Lagrange" },
                { id: "deep-lagrange-works", title: "Deep Dive: Why Lagrange Works", parent: "lagrange", deepDive: true },
                { id: "newton", title: "Newton Representation", navTitle: "Newton" },
                { id: "deep-newton-divided-differences", title: "Deep Dive: Divided Differences", parent: "newton", deepDive: true },
                { id: "choice-points", title: "Choice of Interpolation Points", navTitle: "Choice of Points" },
                { id: "deep-choice-points", title: "Deep Dive: Choosing Points", parent: "choice-points", deepDive: true },
                { id: "splines", title: "Piecewise Polynomial Interpolation", navTitle: "Splines" },
                { id: "deep-splines", title: "Deep Dive: What a Spline Is", parent: "splines", deepDive: true }
            ],
            matlabBlocks: {
                polynomial_demo: "x = [0 1 2]\ny = [1 3 2]\np = polyfit(x, y, 2)\npolyval(p, 1.5)",
                polynomial_plot_demo: "x = [0 1 2]\ny = [1 3 2]\nfigure\nplot(x, y, 'ro')\np = polyfit(x, y, 2)\nxq = 0:0.1:2\nyq = polyval(p, xq)\nhold on\nplot(xq, yq, 'b-')",
                lagrange_demo: "x = [0 1 2]\ny = [1 3 2]\nxq = 0:0.1:2\n\np = polyfit(x, y, 2)\ny_polyfit = polyval(p, xq)\ny_lagrange = lagrange(x, y, xq)\n\nfigure\nsubplot(1,2,1)\nplot(x, y, 'ko')\nhold on\nplot(xq, y_polyfit, 'b-')\naxis([0 2 0 3.5])\nsubplot(1,2,2)\nplot(x, y, 'ko')\nhold on\nplot(xq, y_lagrange, 'r-')\naxis([0 2 0 3.5])\ndifference = max(abs(y_polyfit - y_lagrange))",
                newton_demo: "x = [0 1 2 3]\ny = [1 3 2 5]\nx_more = [0 1 2 3 4]\ny_more = [1 3 2 5 4]\nxq = 0:0.1:3\nxq_more = 0:0.1:4\n\np = polyfit(x, y, 3)\ny_polyfit = polyval(p, xq)\ny_newton = newtoninterp(x_more, y_more, xq_more)\n\nfigure\nsubplot(1,2,1)\nplot(x, y, 'ko')\nhold on\nplot(xq, y_polyfit, 'b-')\naxis([0 4 0 6.5])\nsubplot(1,2,2)\nplot(x_more, y_more, 'ko')\nhold on\nplot(xq_more, y_newton, 'r-')\naxis([0 4 0 6.5])",
                point_choice_demo: "x = linspace(-1, 1, 9)\ny = 1 ./ (1 + 25*x.^2)\nxx = linspace(-1, 1, 101)\np = polyfit(x, y, 8)\nyy = polyval(p, xx)\nfigure\nplot(x, y, 'ko')\nhold on\nplot(xx, yy, 'r-')",
                node_product_demo: "i = 0:8;\n\n% Equally spaced nodes: uniform grid on [-1,1]\nxe = linspace(-1, 1, 9);\n\n% Chebyshev zeros: cosine formula, clustered near endpoints\nxc = cos((2*i + 1)*pi/(2*9));\n\n% Plot only the x-locations of the chosen nodes\nye = 0.15*ones(1, 9);\nyc = -0.15*ones(1, 9);\n\nfigure\nplot(xe, ye, 'ro')\nhold on\nplot(xc, yc, 'bo')\naxis([-1 1 -0.5 0.5])\nxlabel('x')\ntitle('Node locations')",
                point_choice_compare_demo: "f = @(x) 1 ./ (1 + 25*x.^2)\nxx = linspace(-1, 1, 101)\nytrue = f(xx)\ni = 0:8\n\n% Equally spaced nodes: simple, but can oscillate near endpoints\nxe = linspace(-1, 1, 9)\nye = f(xe)\n\n% Chebyshev zeros: cosine formula clusters nodes near endpoints\nxc = cos((2*i + 1)*pi/(2*9))\nyc = f(xc)\n\n% Compare degree-8 interpolants built from the two node choices\npe = polyfit(xe, ye, 8)\npc = polyfit(xc, yc, 8)\nze = zeros(1, 9)\nfigure\nplot(xx, ytrue, 'k-')\nhold on\nplot(xx, polyval(pe, xx), 'r-')\nplot(xx, polyval(pc, xx), 'b-')\nplot(xe, ze, 'ro')\nplot(xc, ze, 'bo')",
                spline_demo: "x = [0 0.4 1.3 1.8 2.6 3.5 4.2]\ny = [0 1.1 0.2 1.7 1.2 2.1 1.4]\nxx = linspace(0, 4.2, 101)\nyy = spline(x, y, xx)\nfigure\nplot(x, y, 'ko')\nhold on\nplot(xx, yy, 'g-')"
            },
            html: `
                <section id="approximation-data">
                    <h2>Approximation of Functions and Data</h2>
                    <p>Approximation replaces unknown or complicated data with a simpler function. Imagine you measure your weight on several days. You know only those measured points, but you want a function that estimates the weight between them.</p>
                    <p><strong>Interpolation</strong> is the special case where the approximating function passes exactly through the known points. First we choose points, for example day 0, day 1, day 2, and day 3. Then we choose a type of function that will pass through those points.</p>
                    <div class="math-card">
                        <strong>Mental picture:</strong> dots are known data. The curve is not measured directly; it is a constructed function that goes through the dots and gives estimates between them.
                    </div>
                    <p>The advantage is that we can estimate values between measurements and later study the approximating function. The risk is that a function can pass through all points and still behave badly between them, so the method and the chosen points matter.</p>
                    <p>Interpolation turns discrete points into a usable function. The rest of this chapter explains different ways to build that function.</p>
                </section>

                 <section id="polynomial-interpolation">
                    <h2>Polynomial Interpolation</h2>
                    <p>Given \\(n+1\\) distinct points, there is a unique polynomial of degree at most \\(n\\) passing through them. Polynomials are convenient because they are smooth, easy to evaluate, and easy to differentiate.</p>
                    <p>Given \\(n+1\\) points with corresponding x-coordinates stored in variable <code>x</code> and y-coordinates stored in variable <code>y</code>, <code>polyfit(x,y,n)</code> returns polynomial coefficients, highest power first. <code>polyval(p,xq)</code> evaluates that polynomial with coefficients at <code>xq</code>.</p>
                    <div class="matlab-block">
                        <pre>x = [0 1 2]
y = [1 3 2]
p = polyfit(x, y, 2)
polyval(p, 1.5)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="polynomial_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Polynomial form is good when you need evaluation and derivatives, but high degree can be risky.</p>
                </section>

                <section id="polynomial-plotting">
                    <h2>Plotting the Polynomial</h2>
                    <p>To see the curve, evaluate the polynomial at many x-values, not only at one point. The vector <code>xq = 0:0.1:2</code> creates closely spaced points from 0 to 2, and <code>polyval(p,xq)</code> gives the polynomial values there.</p>
                    <p><code>figure</code> opens a plot window. <code>hold on</code> tells MATLAB to keep the existing plot, so the curve is drawn on the same axes as the original points instead of replacing them.</p>
                    <div class="matlab-block">
                        <pre>x = [0 1 2]
y = [1 3 2]
figure
plot(x, y, 'ro')
p = polyfit(x, y, 2)
xq = 0:0.1:2
yq = polyval(p, xq)
hold on
plot(xq, yq, 'b-')</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="polynomial_plot_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Plotting many evaluated points turns the polynomial from coefficients into a visible curve.</p>
                </section>

                <section id="deep-polynomial-coefficients" class="deep-dive">
                    <h2>Deep Dive: Polynomial Coefficients</h2>
                    <p>For points \\((x_0,y_0),\\ldots,(x_n,y_n)\\), polynomial interpolation assumes</p>
                    <p>$$ P_n(x)=a_0x^n+a_1x^{n-1}+\\cdots+a_n. $$</p>
                    <p>The coefficients come from forcing the polynomial through every known point:</p>
                    <p>$$ P_n(x_0)=y_0,\\quad P_n(x_1)=y_1,\\quad \\ldots,\\quad P_n(x_n)=y_n. $$</p>
                    <p>Each known point gives one equation because substituting \\(x_i\\) into the polynomial must return the matching value \\(y_i\\). The unknowns are the coefficients \\(a_0,a_1,\\ldots,a_n\\), not the data points. Written as a matrix equation, the coefficient problem is:</p>
                    <p>$$
                    \\begin{bmatrix}
                    x_0^n & x_0^{n-1} & \\cdots & x_0 & 1\\\\
                    x_1^n & x_1^{n-1} & \\cdots & x_1 & 1\\\\
                    \\vdots & \\vdots & \\ddots & \\vdots & \\vdots\\\\
                    x_n^n & x_n^{n-1} & \\cdots & x_n & 1
                    \\end{bmatrix}
                    \\begin{bmatrix}
                    a_0\\\\
                    a_1\\\\
                    \\vdots\\\\
                    a_n
                    \\end{bmatrix}
                    =
                    \\begin{bmatrix}
                    y_0\\\\
                    y_1\\\\
                    \\vdots\\\\
                    y_n
                    \\end{bmatrix}.
                    $$</p>
                    <p>The first matrix is called the Vandermonde matrix. Row \\(i\\) contains the powers of one input value \\(x_i\\). Multiplying that row by the coefficient vector produces \\(P_n(x_i)\\), so the right side forces the answer to equal \\(y_i\\).</p>
                    <p>For three points and a quadratic \\(P_2(x)=ax^2+bx+c\\), the equations are:</p>
                    <p>$$ ax_0^2+bx_0+c=y_0,\\quad ax_1^2+bx_1+c=y_1,\\quad ax_2^2+bx_2+c=y_2. $$</p>
                    <p>Those same equations become this smaller matrix system:</p>
                    <p>$$
                    \\begin{bmatrix}
                    x_0^2 & x_0 & 1\\\\
                    x_1^2 & x_1 & 1\\\\
                    x_2^2 & x_2 & 1
                    \\end{bmatrix}
                    \\begin{bmatrix}
                    a\\\\
                    b\\\\
                    c
                    \\end{bmatrix}
                    =
                    \\begin{bmatrix}
                    y_0\\\\
                    y_1\\\\
                    y_2
                    \\end{bmatrix}.
                    $$</p>
                    <p>For the example points \\((0,1)\\), \\((1,3)\\), and \\((2,2)\\), this becomes:</p>
                    <p>$$
                    \\begin{bmatrix}
                    0^2 & 0 & 1\\\\
                    1^2 & 1 & 1\\\\
                    2^2 & 2 & 1
                    \\end{bmatrix}
                    \\begin{bmatrix}
                    a\\\\
                    b\\\\
                    c
                    \\end{bmatrix}
                    =
                    \\begin{bmatrix}
                    1\\\\
                    3\\\\
                    2
                    \\end{bmatrix},
                    \\qquad
                    \\text{or}
                    \\qquad
                    \\begin{bmatrix}
                    0 & 0 & 1\\\\
                    1 & 1 & 1\\\\
                    4 & 2 & 1
                    \\end{bmatrix}
                    \\begin{bmatrix}
                    a\\\\
                    b\\\\
                    c
                    \\end{bmatrix}
                    =
                    \\begin{bmatrix}
                    1\\\\
                    3\\\\
                    2
                    \\end{bmatrix}.
                    $$</p>
                    <p>Solving this system gives the coefficients of the polynomial in ordinary power form. <code>polyfit(x,y,n)</code> performs this coefficient-finding step and returns the coefficients from highest power to constant term.</p>
                    <p>Polynomial coefficients are not guessed; they are chosen so the polynomial satisfies the interpolation conditions.</p>
                </section>

                <section id="lagrange">
                    <h2>Lagrange Representation</h2>
                    <p>The Lagrange form builds the same interpolating polynomial as <code>polyfit</code>, but it does not first solve for powers like \\(ax^2+bx+c\\). Instead, it builds one small basis polynomial for each data point.</p>
                    <p>Each basis polynomial \\(L_j(x)\\) acts like a switch: it is 1 at its own node \\(x_j\\), and 0 at every other node. That means \\(y_jL_j(x)\\) contributes exactly the data value \\(y_j\\) at its own point and disappears at the other points.</p>
                    <p>\\[
                        P_n(x)=\\sum_{j=0}^{n} y_j L_j(x)
                    \\]</p>
                    <p>where</p>
                    <p>\\[
                        L_j(x)=\\prod_{m\\ne j}\\frac{x-x_m}{x_j-x_m}
                    \\]</p>
                    <p>For the same points used above, \\((0,1)\\), \\((1,3)\\), and \\((2,2)\\), the Lagrange calculation and <code>polyfit</code>/<code>polyval</code> create the same polynomial. The figure below puts them side by side on the same axes; the last line checks that the plotted values differ only by roundoff.</p>
                    <div class="matlab-block">
                        <pre>x = [0 1 2]
y = [1 3 2]
xq = 0:0.1:2

p = polyfit(x, y, 2)
y_polyfit = polyval(p, xq)
y_lagrange = lagrange(x, y, xq)

figure
subplot(1,2,1)
plot(x, y, 'ko')
hold on
plot(xq, y_polyfit, 'b-')
axis([0 2 0 3.5])
subplot(1,2,2)
plot(x, y, 'ko')
hold on
plot(xq, y_lagrange, 'r-')
axis([0 2 0 3.5])
difference = max(abs(y_polyfit - y_lagrange))</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="lagrange_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Lagrange form is mainly a different representation of the same polynomial. Its strength is that it shows exactly how each data point contributes to the value at <code>xq</code>; its weakness is that adding a new data point changes all the basis polynomials.</p>
                </section>

                <section id="deep-lagrange-works" class="deep-dive">
                    <h2>Deep Dive: Why Lagrange Works</h2>
                    <p>The basis polynomial \\(L_j(x)\\) is built to have two properties:</p>
                    <p>$$ L_j(x_j)=1,\\qquad L_j(x_m)=0\\quad(m\\ne j). $$</p>
                    <p>The numerator \\((x-x_m)\\) makes \\(L_j(x_m)=0\\) at every other node. The denominator \\((x_j-x_m)\\) normalizes the value so \\(L_j(x_j)=1\\).</p>
                    <p>When we form</p>
                    <p>$$ P_n(x)=y_0L_0(x)+y_1L_1(x)+\\cdots+y_nL_n(x), $$</p>
                    <p>and substitute \\(x=x_k\\), every term becomes zero except the one with \\(L_k(x_k)=1\\). Therefore \\(P_n(x_k)=y_k\\).</p>
                    <p>The reason this gives the interpolating polynomial is uniqueness: two different polynomials of degree at most \\(n\\) cannot agree at \\(n+1\\) distinct points. Their difference would have too many roots unless it is the zero polynomial.</p>
                    <p>Lagrange works because each basis polynomial selects exactly one data value and cancels all the others.</p>
                </section>

                <section id="newton">
                    <h2>Newton Representation</h2>
                    <p>Newton interpolation writes the polynomial using divided differences. Its main advantage is incremental construction: adding a new node adds one new term instead of rebuilding everything.</p>
                    <p>$$ P_n(x)=a_0+a_1(x-x_0)+a_2(x-x_0)(x-x_1)+\\cdots $$</p>
                    <p>For the five-point example, the divided differences are computed from repeated slope corrections:</p>
                    <p>\\[
                        d_{ij}=\\frac{y_j-y_i}{x_j-x_i},\\qquad
                        d_{ijk}=\\frac{d_{jk}-d_{ij}}{x_k-x_i},\\qquad
                        d_{01234}=\\frac{d_{1234}-d_{0123}}{x_4-x_0}.
                    \\]</p>
                    <p>The plotted Newton polynomial is therefore</p>
                    <p>\\[
                        P_4(x)=y_0+d_{01}(x-x_0)+d_{012}(x-x_0)(x-x_1)+d_{0123}(x-x_0)(x-x_1)(x-x_2)+d_{01234}(x-x_0)(x-x_1)(x-x_2)(x-x_3).
                    \\]</p>
                    <p>The example below compares a polynomial through four points with a Newton polynomial after adding a fifth point. Both plots use the same axes; the only data difference is that the second plot has one more point and one more correction term.</p>
                    <div class="matlab-block">
                        <pre>x = [0 1 2 3]
y = [1 3 2 5]
x_more = [0 1 2 3 4]
y_more = [1 3 2 5 4]
xq = 0:0.1:3
xq_more = 0:0.1:4

p = polyfit(x, y, 3)
y_polyfit = polyval(p, xq)
y_newton = newtoninterp(x_more, y_more, xq_more)

figure
subplot(1,2,1)
plot(x, y, 'ko')
hold on
plot(xq, y_polyfit, 'b-')
axis([0 4 0 6.5])
subplot(1,2,2)
plot(x_more, y_more, 'ko')
hold on
plot(xq_more, y_newton, 'r-')
axis([0 4 0 6.5])</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="newton_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Newton form is useful when data arrives one point at a time.</p>
                </section>

                <section id="deep-newton-divided-differences" class="deep-dive">
                    <h2>Deep Dive: Divided Differences</h2>
                    <p>Newton form uses nested factors:</p>
                    <p>$$ P_n(x)=a_0+a_1(x-x_0)+a_2(x-x_0)(x-x_1)+\\cdots. $$</p>
                    <p>The first coefficient is simply \\(a_0=y_0\\). The next coefficient is the slope through the first two points:</p>
                    <p>$$ a_1=\\frac{y_1-y_0}{x_1-x_0}. $$</p>
                    <p>The coefficient \\(a_2\\) corrects the straight-line approximation so the polynomial also passes through \\((x_2,y_2)\\):</p>
                    <p>$$ a_2=\\frac{\\frac{y_2-y_1}{x_2-x_1}-\\frac{y_1-y_0}{x_1-x_0}}{x_2-x_0}. $$</p>
                    <p>These are called divided differences. Higher-order divided differences repeat the same idea: compare lower-order differences and divide by the full distance between the outer nodes.</p>
                    <p>The practical advantage is that if a new point is added, old coefficients stay useful. You add one new divided difference and one new factor.</p>
                    <p>Newton coefficients measure how much correction is needed when each new interpolation point is added.</p>
                </section>

                <section id="choice-points">
                    <h2>Choice of Interpolation Points</h2>
                    <p>The interpolation nodes affect the behavior of the polynomial. Equally spaced points are simple, but high-degree interpolation may oscillate near the interval ends. Better-distributed points are often denser near the endpoints, which reduces the large endpoint swings caused by the product <code>(x-x0)(x-x1)...(x-xn)</code>. This is why point placement can matter as much as the degree of the polynomial.</p>
                    <div class="math-card">
                        <strong>Practical lesson:</strong> increasing degree is not automatically better. Point placement and the function shape matter.
                    </div>
                    <div class="matlab-block">
                        <pre>x = linspace(-1, 1, 9)
y = 1 ./ (1 + 25*x.^2)
xx = linspace(-1, 1, 101)
p = polyfit(x, y, 8)
yy = polyval(p, xx)
figure
plot(x, y, 'ko')
hold on
plot(xx, yy, 'r-')</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="point_choice_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>A high-degree polynomial can fit the points exactly and still behave poorly near endpoints.</p>
                </section>

                <section id="deep-choice-points" class="deep-dive">
                    <h2>Deep Dive: Choosing Points</h2>
                    <p>The interpolation error has the form</p>
                    <p>$$ f(x)-P_n(x)=\\frac{f^{(n+1)}(\\xi)}{(n+1)!}\\prod_{j=0}^{n}(x-x_j). $$</p>
                    <p>The derivative factor depends on the function. The product factor depends only on the chosen nodes, so the node placement is something we can control.</p>
                    <p><strong>Equally spaced nodes</strong> are the simplest choice:</p>
                    <p>$$ x_i=a+i\\frac{b-a}{n},\\qquad i=0,1,\\ldots,n. $$</p>
                    <p>They are easy to construct, but for high degree the product \\(\\prod(x-x_j)\\) can become large near the endpoints. That is one reason endpoint oscillations may appear.</p>
                    <p><strong>Chebyshev-type nodes</strong> place more points near the ends of the interval. One common choice uses the zeros of a Chebyshev polynomial:</p>
                    <p>$$ x_i=\\frac{a+b}{2}+\\frac{b-a}{2}\\cos\\left(\\frac{(2i+1)\\pi}{2n+2}\\right),\\qquad i=0,1,\\ldots,n. $$</p>
                    <p>Another common endpoint-including version uses extrema:</p>
                    <p>$$ x_i=\\frac{a+b}{2}+\\frac{b-a}{2}\\cos\\left(\\frac{i\\pi}{n}\\right),\\qquad i=0,1,\\ldots,n. $$</p>
                    <p>Both choices are denser near endpoints. The goal is not to make the derivative factor small; it is to keep the node-product factor smaller and more balanced across the interval.</p>
                    <p><strong>Data nodes</strong> are chosen by measurement: if the experiment gives values at fixed times, those are the nodes. If you are free to choose where to sample, endpoint-clustered nodes can be much safer for one high-degree polynomial. If many irregular data points are already given, splines are often a better tool than one large polynomial.</p>
                    <p>The next block compares the x-locations of equally spaced nodes and Chebyshev zeros. The Chebyshev nodes are computed from the cosine formula above, not typed as fixed decimals.</p>
                    <div class="matlab-block">
                        <pre>i = 0:8;

% Equally spaced nodes: uniform grid on [-1,1]
xe = linspace(-1, 1, 9);

% Chebyshev zeros: cosine formula, clustered near endpoints
xc = cos((2*i + 1)*pi/(2*9));

% Plot only the x-locations of the chosen nodes
ye = 0.15*ones(1, 9);
yc = -0.15*ones(1, 9);

figure
plot(xe, ye, 'ro')
hold on
plot(xc, yc, 'bo')
axis([-1 1 -0.5 0.5])
xlabel('x')
title('Node locations')</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="node_product_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>This block compares the interpolating polynomials on the same function. The black curve is the target function, red uses equally spaced nodes, and blue uses endpoint-clustered nodes.</p>
                    <div class="matlab-block">
                        <pre>f = @(x) 1 ./ (1 + 25*x.^2)
xx = linspace(-1, 1, 101)
ytrue = f(xx)
i = 0:8

% Equally spaced nodes: simple, but can oscillate near endpoints
xe = linspace(-1, 1, 9)
ye = f(xe)

% Chebyshev zeros: cosine formula clusters nodes near endpoints
xc = cos((2*i + 1)*pi/(2*9))
yc = f(xc)

% Compare degree-8 interpolants built from the two node choices
pe = polyfit(xe, ye, 8)
pc = polyfit(xc, yc, 8)
ze = zeros(1, 9)
figure
plot(xx, ytrue, 'k-')
hold on
plot(xx, polyval(pe, xx), 'r-')
plot(xx, polyval(pc, xx), 'b-')
plot(xe, ze, 'ro')
plot(xc, ze, 'bo')</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="point_choice_compare_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Choosing interpolation points is part of the numerical method, because the points control the error factor that the polynomial inherits.</p>
                </section>

                <section id="splines">
                    <h2>Piecewise Polynomial Interpolation</h2>
                    <p>Splines replace one high-degree polynomial with lower-degree polynomials on subintervals. Cubic splines are especially common because they balance smoothness and computational control.</p>
                    <p>A cubic spline is continuous, has continuous first and second derivatives, and passes through the data points.</p>
                    <div class="matlab-block">
                        <pre>x = [0 0.4 1.3 1.8 2.6 3.5 4.2]
y = [0 1.1 0.2 1.7 1.2 2.1 1.4]
xx = linspace(0, 4.2, 101)
yy = spline(x, y, xx)
figure
plot(x, y, 'ko')
hold on
plot(xx, yy, 'g-')</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="spline_demo">Load in MATLAB</button>
                        </div>
                    </div>
                    <p>Splines are often safer than one large polynomial because they keep each local piece simple.</p>
                </section>

                <section id="deep-splines" class="deep-dive">
                    <h2>Deep Dive: What a Spline Is</h2>
                    <p>A spline is not one polynomial over the whole interval. It is a collection of small polynomials, one on each subinterval:</p>
                    <p>$$ S(x)=S_i(x)\\quad \\text{for }x_i\\le x\\le x_{i+1}. $$</p>
                    <p>For a cubic spline, each piece \\(S_i\\) is a polynomial of degree at most 3. The pieces must meet at the data points, so the curve is continuous. Usually we also require the first and second derivatives to match at interior nodes:</p>
                    <p>$$ S_{i-1}(x_i)=S_i(x_i),\\quad S'_{i-1}(x_i)=S'_i(x_i),\\quad S''_{i-1}(x_i)=S''_i(x_i). $$</p>
                    <p>These conditions make the graph look smooth instead of broken. Extra endpoint conditions are needed to determine a unique spline; common choices control the second derivative or endpoint slopes.</p>
                    <p>The reason splines are useful is local control. Changing one data point mainly affects nearby pieces, while one high-degree polynomial can react across the whole interval.</p>
                    <p>A spline is a smooth piecewise polynomial, designed to avoid the global oscillations of one large interpolating polynomial.</p>
                </section>
            `
        },
        {
            id: "lu",
            title: "Linear Systems and LU Decomposition",
            shortTitle: "LU Decomposition",
            kicker: "Chapter 3",
            folder: "3. Lu",
            sections: [
                { id: "linear-systems", title: "Numerical Solution of Linear Systems", navTitle: "Linear Systems" },
                { id: "deep-matlab-division", title: "Deep Dive: What Backslash Means", parent: "linear-systems", deepDive: true },
                { id: "norms-conditioning", title: "Matrix Norms and Conditioning", navTitle: "Norms and Conditioning" },
                { id: "deep-conditioning-lu", title: "Deep Dive: Error Amplification", parent: "norms-conditioning", deepDive: true },
                { id: "triangular-systems", title: "Triangular Systems", navTitle: "Triangular Systems" },
                { id: "deep-substitution", title: "Deep Dive: Substitution Formulas", parent: "triangular-systems", deepDive: true },
                { id: "gauss-pivoting", title: "Gaussian Elimination and Pivoting", navTitle: "Gaussian Elimination" },
                { id: "deep-pivoting", title: "Deep Dive: Why Pivoting Helps", parent: "gauss-pivoting", deepDive: true },
                { id: "lu-factorization", title: "PA=LU Factorization", navTitle: "PA=LU" },
                { id: "deep-lu-derivation", title: "Deep Dive: How LU Stores Elimination", parent: "lu-factorization", deepDive: true },
                { id: "lu-applications", title: "Applications of LU", navTitle: "LU Applications" },
                { id: "deep-lu-applications", title: "Deep Dive: Determinants and Cost", parent: "lu-applications", deepDive: true },
                { id: "cholesky", title: "Cholesky Factorization", navTitle: "Cholesky" },
                { id: "deep-cholesky", title: "Deep Dive: Cholesky Derivation", parent: "cholesky", deepDive: true }
            ],
            matlabBlocks: {
                system_intro: "A = [4 1; 2 3]\nb = [1; 7]\nx = A \\ b",
                norm_cond: "A = [1 1; 1 1.0001]\nnorm(A)\ncond(A)",
                triangular_demo: "L = [1 0 0; 2 1 0; -1 3 1]\nb = [1; 4; 2]\ny = L \\ b",
                gauss_demo: "A = [0.001 1; 1 1]\nb = [1; 2]\nx = A \\ b",
                lu_intro: "A = [4 3; 6 3]\n[L, U, P] = lu(A)\nP*A\nL*U",
                lu_solve: "A = [4 3; 6 3]\nb = [7; 9]\n[L, U, P] = lu(A)\ny = L \\ (P*b)\nx = U \\ y",
                det_lu: "A = [4 3; 6 3]\n[L, U, P] = lu(A)\ndet(A)\nprod(diag(U))",
                chol_demo: "A = [4 2; 2 3]\nR = chol(A)\nR' * R"
            },
            html: `
                <section id="linear-systems">
                    <h2>Numerical Solution of Linear Systems</h2>
                    <p>Linear systems appear throughout engineering models. Direct methods, such as Gaussian elimination and LU factorization, solve \\(Ax=b\\) without explicitly computing \\(A^{-1}\\). This is usually cheaper and more reliable.</p>
                    <div class="math-card">
                        <strong>Notation warning:</strong> in linear algebra, you do not divide a matrix by a vector. In MATLAB, <code>A \\ b</code> means "solve <code>A*x = b</code>". It is not ordinary division. MATLAB also has <code>A / B</code>, but that means right matrix division and solves a different kind of equation.
                    </div>
                    <div class="matlab-block">
                        <pre>A = [4 1; 2 3]
b = [1; 7]
x = A \\ b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="system_intro">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-matlab-division" class="deep-dive">
                    <h2>Deep Dive: What Backslash Means</h2>
                    <p>The mathematical problem is \\(Ax=b\\). We want the vector \\(x\\). On paper, it is tempting to write \\(x=A^{-1}b\\), but in computation this is usually not how we solve the system.</p>
                    <p>MATLAB's command <code>x = A \\ b</code> means: choose an appropriate numerical method to solve \\(Ax=b\\). Depending on \\(A\\), MATLAB may use triangular substitution, Gaussian elimination, LU factorization, Cholesky factorization, or a least-squares method.</p>
                    <p>The command <code>A / B</code> is different. It means right division and corresponds to solving for something like \\(X B = A\\). That is why <code>A / b</code> is not the notation for solving \\(Ax=b\\).</p>
                    <p>Use <code>A \\ b</code> for systems \\(Ax=b\\); do not think of it as matrix divided by vector.</p>
                </section>

                <section id="norms-conditioning">
                    <h2>Matrix Norms and Conditioning</h2>
                    <p>A norm is a way to measure size. For a vector, it is like length. For a matrix, it measures how much the matrix can stretch vectors.</p>
                    <p>Conditioning asks a practical question: if the input changes a little, does the answer change a little or a lot? For \\(Ax=b\\), a badly conditioned matrix can turn tiny changes in \\(b\\) into large changes in \\(x\\).</p>
                    <p>The condition number \\(\\kappa(A)\\) is the warning number. Small is good. Very large means the system is sensitive.</p>
                    <p>$$ \\frac{\\|\\Delta x\\|}{\\|x\\|}\\lesssim \\kappa(A)\\frac{\\|\\Delta b\\|}{\\|b\\|} $$</p>
                    <div class="matlab-block">
                        <pre>A = [1 1; 1 1.0001]
norm(A)
cond(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="norm_cond">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-conditioning-lu" class="deep-dive">
                    <h2>Deep Dive: Error Amplification</h2>
                    <p>The condition number is \\(\\kappa(A)=\\|A\\|\\|A^{-1}\\|\\). It compares the size of the matrix with the size of the inverse operation. If \\(\\kappa(A)\\) is large, then solving \\(Ax=b\\) can amplify small errors.</p>
                    <p>The estimate</p>
                    <p>$$ \\frac{\\|\\Delta x\\|}{\\|x\\|}\\lesssim \\kappa(A)\\frac{\\|\\Delta b\\|}{\\|b\\|} $$</p>
                    <p>says that relative error in the data may be multiplied by approximately \\(\\kappa(A)\\). This is about the problem itself, not only about the algorithm. Even a stable method can struggle when the problem is ill-conditioned.</p>
                    <p>Before blaming an algorithm, check whether the system itself is sensitive.</p>
                </section>

                <section id="triangular-systems">
                    <h2>Triangular Systems</h2>
                    <p>A triangular matrix has zeros on one side of the diagonal. A lower triangular matrix has zeros above the diagonal. An upper triangular matrix has zeros below the diagonal.</p>
                    <p>These systems are useful because one equation contains only one new unknown at a time. In a lower triangular system, the first row gives the first unknown, then the second row gives the second unknown, and so on. This is called <strong>forward substitution</strong>.</p>
                    <div class="math-card">
                        <strong>Forward substitution:</strong> solve from top to bottom. Each new row uses values already computed above it.
                    </div>
                    <div class="substitution-visualizer visualizer-card" data-mode="forward" data-matrix="2,0,0;3,1,0;-1,4,2" data-vector="4;8;2">
                        <h3>Forward Substitution Visualizer</h3>
                        <p>Use a lower triangular matrix. Edit the number boxes, then watch each unknown update row by row.</p>
                        <div class="substitution-layout">
                            <div class="substitution-editor" data-role="editor"></div>
                            <iframe class="substitution-frame" title="Forward substitution animation"></iframe>
                        </div>
                        <div class="visualizer-actions">
                            <button type="button" data-action="run">Update Steps</button>
                            <button type="button" data-action="prev">Previous</button>
                            <button type="button" data-action="next">Next</button>
                        </div>
                        <div class="substitution-output" data-role="output"></div>
                    </div>
                    <p>In an upper triangular system, the last row gives the last unknown first. Then the row above uses that value. This is called <strong>backward substitution</strong>.</p>
                    <div class="math-card">
                        <strong>Backward substitution:</strong> solve from bottom to top. Each row uses values already computed below it.
                    </div>
                    <div class="substitution-visualizer visualizer-card" data-mode="backward" data-matrix="3,-1,2;0,2,4;0,0,-2" data-vector="7;10;-6">
                        <h3>Backward Substitution Visualizer</h3>
                        <p>Use an upper triangular matrix. Edit the number boxes; the solver starts at the last equation, then moves upward.</p>
                        <div class="substitution-layout">
                            <div class="substitution-editor" data-role="editor"></div>
                            <iframe class="substitution-frame" title="Backward substitution animation"></iframe>
                        </div>
                        <div class="visualizer-actions">
                            <button type="button" data-action="run">Update Steps</button>
                            <button type="button" data-action="prev">Previous</button>
                            <button type="button" data-action="next">Next</button>
                        </div>
                        <div class="substitution-output" data-role="output"></div>
                    </div>
                    <p>Later in this chapter, LU factorization will use this idea: first transform a general system into triangular pieces, then solve those pieces by substitution.</p>
                    <div class="matlab-block">
                        <pre>L = [1 0 0; 2 1 0; -1 3 1]
b = [1; 4; 2]
y = L \\ b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="triangular_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-substitution" class="deep-dive">
                    <h2>Deep Dive: Substitution Formulas</h2>
                    <p>For a lower triangular system \\(Ly=b\\), row \\(i\\) has the form:</p>
                    <p>$$ l_{i1}y_1+l_{i2}y_2+\\cdots+l_{ii}y_i=b_i. $$</p>
                    <p>By the time we reach row \\(i\\), the earlier unknowns \\(y_1,\\ldots,y_{i-1}\\) are already known. Therefore:</p>
                    <p>$$ y_i=\\frac{b_i-\\sum_{j=1}^{i-1}l_{ij}y_j}{l_{ii}}. $$</p>
                    <p>For an upper triangular system \\(Ux=y\\), we work upward:</p>
                    <p>$$ x_i=\\frac{y_i-\\sum_{j=i+1}^{n}u_{ij}x_j}{u_{ii}}. $$</p>
                    <p>Substitution works because each triangular row introduces only one new unknown.</p>
                </section>

                <section id="gauss-pivoting">
                    <h2>Gaussian Elimination and Pivoting</h2>
                    <p>Gaussian elimination is the process of using row operations to create zeros below the diagonal. After these zeros are created, the system becomes upper triangular, so it can be solved by backward substitution.</p>
                    <p>A <strong>pivot</strong> is the diagonal entry used to eliminate entries below it. If the pivot is zero, elimination cannot continue. If it is very small, the arithmetic can become unreliable. <strong>Pivoting</strong> means swapping rows to choose a better pivot.</p>
                    <p><strong>Partial pivoting</strong> chooses the largest available entry in the current column and swaps that row into the pivot position.</p>
                    <div class="matlab-block">
                        <pre>A = [0.001 1; 1 1]
b = [1; 2]
x = A \\ b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="gauss_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-pivoting" class="deep-dive">
                    <h2>Deep Dive: Why Pivoting Helps</h2>
                    <p>Elimination divides by the pivot. If the pivot is very small, the multiplier becomes large, and rounding errors can be magnified. Row exchanges move a better pivot into position before the division happens.</p>
                    <p>Partial pivoting means: in the current column \\(k\\), choose the entry with largest absolute value among rows \\(k,k+1,\\ldots,n\\), then swap that row into the pivot position. Absolute value matters: \\(-6\\) is a better pivot candidate than \\(4\\), because \\(|-6|=6\\).</p>
                    <p>The row swaps are recorded by a permutation matrix \\(P\\). When rows are swapped in the working matrix, the same row swap is stored in \\(P\\). That is why LU with pivoting is written \\(PA=LU\\), not simply \\(A=LU\\).</p>
                    <p>Pivoting is a stability tool: it changes the order of equations, not the solution.</p>
                </section>

                <section id="lu-factorization">
                    <h2>PA=LU Factorization</h2>
                    <p>LU factorization rewrites a matrix problem using triangular matrices. The goal is to replace one general system with triangular systems, because triangular systems are easy to solve by substitution.</p>
                    <p>Without row swaps the idea is \\(A=LU\\): start with \\(U=A\\), then use elimination until \\(U\\) becomes upper triangular. The multipliers used during elimination are stored in the lower triangular matrix \\(L\\).</p>
                    <p>With partial pivoting, row swaps may happen before elimination in each column. Those swaps are stored in \\(P\\). Then the factorization is written as:</p>
                    <p>$$ PA=LU $$</p>
                    <p>Here \\(P\\) is a permutation matrix: it records row swaps. Multiplying by \\(P\\) reorders the rows of \\(A\\). The matrix \\(L\\) is lower triangular, and \\(U\\) is upper triangular.</p>
                    <div class="matlab-block">
                        <pre>A = [4 3; 6 3]
[L, U, P] = lu(A)
P*A
L*U</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="lu_intro">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-lu-derivation" class="deep-dive">
                    <h2>Deep Dive: How PA=LU Works</h2>
                    <p>Gaussian elimination turns a working copy of \\(A\\) into an upper triangular matrix \\(U\\). At the start, \\(U=A\\), \\(L=I\\), and \\(P=I\\). As elimination proceeds, row swaps are stored in \\(P\\), multipliers are stored in \\(L\\), and row updates change \\(U\\).</p>
                    <p>At stage \\(k\\), column \\(k\\) is the column currently being cleared. The pivot is \\(a_{kk}\\), the entry in row \\(k\\), column \\(k\\), after any pivoting swap. An entry \\(a_{ik}\\) means row \\(i\\), column \\(k\\), where \\(i>k\\), so it is below the pivot and should become zero.</p>
                    <p>To eliminate \\(a_{ik}\\) below pivot \\(a_{kk}\\), the multiplier is</p>
                    <p>$$ m_{ik}=\\frac{a_{ik}}{a_{kk}}. $$</p>
                    <p>The row update is</p>
                    <p>$$ R_i \\leftarrow R_i-m_{ik}R_k. $$</p>
                    <p>This update changes row \\(i\\) of \\(U\\), using the pivot row \\(k\\). The same multiplier \\(m_{ik}\\) is saved in row \\(i\\), column \\(k\\) of \\(L\\), so the operation can be reconstructed later. If a row swap is needed, it is accounted for by swapping rows in \\(P\\) as well.</p>
                    <p>After all elimination steps, the upper triangular result is \\(U\\), the stored multipliers form \\(L\\), and the stored swaps form \\(P\\). The final relationship is \\(PA=LU\\).</p>
                    <p>Use this stepper to see how a concrete matrix becomes \\(P\\), \\(L\\), and \\(U\\). This is a theory visualizer, not the MATLAB terminal.</p>
                    <div class="visualizer-card lu-factorizer" data-visualizer="lu-factorizer">
                        <h3>PA=LU Step-by-Step Simulator</h3>
                        <p>Enter a square matrix. Use spaces between entries and new lines or semicolons between rows.</p>
                        <div class="lu-input-grid">
                            <textarea data-lu-input rows="4" spellcheck="false">4 3 2
6 3 1
2 1 3</textarea>
                            <div class="visualizer-actions lu-actions">
                                <button data-lu-factor>Factorize</button>
                                <button data-lu-prev>Previous</button>
                                <button data-lu-next>Next</button>
                                <button data-lu-reset>Reset</button>
                            </div>
                        </div>
                        <div class="process-stage" data-lu-status></div>
                        <div class="process-matrices lu-matrices">
                            <div class="process-matrix-wrap">
                                <h4>P</h4>
                                <div data-lu-p></div>
                            </div>
                            <div class="process-matrix-wrap">
                                <h4>L</h4>
                                <div data-lu-l></div>
                            </div>
                            <div class="process-matrix-wrap">
                                <h4>U</h4>
                                <div data-lu-u></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="lu-applications">
                    <h2>Applications of LU</h2>
                    <p>Once \\(PA=LU\\) is known, solving \\(Ax=b\\) becomes a two-step triangular solve. First reorder the right side with \\(P\\), then solve the lower triangular system, then the upper triangular system:</p>
                    <p>$$ Ly=Pb, \\qquad Ux=y $$</p>
                    <p>This is useful when the same matrix \\(A\\) is used with many different right sides. The expensive factorization is done once, and the cheaper triangular solves are repeated.</p>
                    <div class="matlab-block">
                        <pre>A = [4 3; 6 3]
b = [7; 9]
[L, U, P] = lu(A)
y = L \\ (P*b)
x = U \\ y</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="lu_solve">Load in MATLAB</button>
                        </div>
                    </div>
                    <div class="matlab-block">
                        <pre>A = [4 3; 6 3]
[L, U, P] = lu(A)
det(A)
prod(diag(U))</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="det_lu">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-lu-applications" class="deep-dive">
                    <h2>Deep Dive: Determinants and Cost</h2>
                    <p>The cost of a numerical method means the amount of computational work, usually counted in arithmetic operations. Factoring an \\(n\\times n\\) matrix by LU costs on the order of \\(n^3\\) operations. Once the factorization is known, each triangular solve costs only on the order of \\(n^2\\).</p>
                    <p>This is why LU is valuable when solving many systems \\(Ax=b_1, Ax=b_2, \\ldots\\) with the same \\(A\\). Factor \\(A\\) once, then reuse \\(L\\), \\(U\\), and \\(P\\).</p>
                    <p>LU also helps with determinants. If \\(PA=LU\\), then</p>
                    <p>$$ \\det(P)\\det(A)=\\det(L)\\det(U). $$</p>
                    <p>Since \\(L\\) usually has ones on the diagonal, \\(\\det(L)=1\\). The determinant of triangular \\(U\\) is the product of its diagonal entries. Row swaps affect the sign through \\(\\det(P)\\).</p>
                    <p>LU is expensive once, then cheap to reuse.</p>
                </section>

                <section id="cholesky">
                    <h2>Cholesky Factorization</h2>
                    <p>If \\(A\\) is symmetric positive definite, Cholesky factorization is faster and more economical than general LU. <strong>Symmetric</strong> means \\(A=A^T\\): the entries mirror across the diagonal. <strong>Positive definite</strong> means every nonzero vector has positive quadratic energy:</p>
                    <p>$$ x^TAx>0\\qquad (x\\ne 0). $$</p>
                    <p>This condition says the matrix bends every direction upward, so the diagonal square roots that appear during Cholesky stay positive. That is why the factorization can be built without row swaps or pivoting.</p>
                    <p>MATLAB's default form is:</p>
                    <p>$$ A=R^T R $$</p>
                    <div class="matlab-block">
                        <pre>A = [4 2; 2 3]
R = chol(A)
R' * R</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="chol_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-cholesky" class="deep-dive">
                    <h2>Deep Dive: Cholesky Derivation</h2>
                    <p>Cholesky starts from the special structure of a symmetric positive definite matrix. Symmetry means the information above the diagonal repeats the information below it, so we do not need two unrelated triangular factors. We can build one lower triangular factor \\(L\\), then use its transpose as the upper factor:</p>
                    <p>$$ A=LL^T. $$</p>
                    <p>Positive definiteness is the part that makes the construction possible. It says every nonzero direction has positive energy, \\(x^TAx>0\\). During the algorithm, that condition shows up as a positive leftover amount whenever a new diagonal entry is computed.</p>
                    <p>The derivation is coefficient matching. Suppose the first \\(k-1\\) columns of \\(L\\) are already known. In position \\((k,k)\\), the product \\(LL^T\\) gives the sum of squares from row \\(k\\):</p>
                    <p>$$ a_{kk}=l_{k1}^2+l_{k2}^2+\\cdots+l_{k,k-1}^2+l_{kk}^2. $$</p>
                    <p>Therefore the amount left for the new diagonal entry is</p>
                    <p>$$ a_{kk}-\\sum_{j=1}^{k-1}l_{kj}^2 $$</p>
                    <p>and positive definiteness keeps this value greater than zero. That is why the square root is real, positive, and safe to divide by later:</p>
                    <p>$$ l_{kk}=\\sqrt{a_{kk}-\\sum_{j=1}^{k-1}l_{kj}^2} $$</p>
                    <p>After the diagonal entry is known, entries below it are found by matching position \\((i,k)\\). The already-built columns contribute \\(\\sum_{j=1}^{k-1}l_{ij}l_{kj}\\), so the new entry must satisfy:</p>
                    <p>$$ l_{ik}=\\frac{a_{ik}-\\sum_{j=1}^{k-1}l_{ij}l_{kj}}{l_{kk}} $$</p>
                    <p>This is the same spirit as LU: build a triangular factor column by column. The difference is that symmetry links the upper factor to the lower factor, and positive definiteness prevents zero or negative pivots. If a diagonal leftover becomes non-positive, the matrix is not positive definite and Cholesky stops.</p>
                    <div class="visualizer-card lu-factorizer" data-visualizer="cholesky-factorizer">
                        <h3>Cholesky Step-by-Step Simulator</h3>
                        <p>Enter a symmetric positive definite matrix. Press Next to build \\(L\\) one entry at a time; MATLAB's <code>chol</code> returns \\(R=L^T\\).</p>
                        <div class="lu-input-grid">
                            <textarea data-chol-input rows="4" spellcheck="false">4 2
2 3</textarea>
                            <div class="visualizer-actions lu-actions">
                                <button data-chol-factor>Factorize</button>
                                <button data-chol-prev>Previous</button>
                                <button data-chol-next>Next</button>
                                <button data-chol-reset>Reset</button>
                            </div>
                        </div>
                        <div class="process-stage" data-chol-status></div>
                        <div class="process-matrices lu-matrices">
                            <div class="process-matrix-wrap">
                                <h4>A</h4>
                                <div data-chol-a></div>
                            </div>
                            <div class="process-matrix-wrap">
                                <h4>L</h4>
                                <div data-chol-l></div>
                            </div>
                            <div class="process-matrix-wrap">
                                <h4>R = L<sup>T</sup></h4>
                                <div data-chol-r></div>
                            </div>
                        </div>
                    </div>
                </section>
            `
        },
        {
            id: "qr-eigen",
            title: "QR Factorization and Eigenvalues",
            shortTitle: "QR and Eigenvalues",
            kicker: "Chapter 4",
            folder: "4. QR+eigen",
            sections: [
                { id: "qr-factorization", title: "QR Factorization", navTitle: "QR Factorization" },
                { id: "deep-qr-construction", title: "Deep Dive: Constructing Q and R", parent: "qr-factorization", deepDive: true },
                { id: "least-squares", title: "Least Squares", navTitle: "Least Squares" },
                { id: "deep-least-squares", title: "Deep Dive: Normal Equations and QR", parent: "least-squares", deepDive: true },
                { id: "eigenvalues", title: "Eigenvalues", navTitle: "Eigenvalues" },
                { id: "deep-eigenvalues", title: "Deep Dive: Characteristic Equation", parent: "eigenvalues", deepDive: true },
                { id: "power-method", title: "Power Method", navTitle: "Power Method" },
                { id: "deep-power-method", title: "Deep Dive: Why Power Iteration Converges", parent: "power-method", deepDive: true },
                { id: "inverse-power", title: "Inverse Power Method", navTitle: "Inverse Power" },
                { id: "deep-inverse-power", title: "Deep Dive: Shifts and Targeting", parent: "inverse-power", deepDive: true },
                { id: "qr-eigen-method", title: "QR Method for Eigenvalues", navTitle: "QR Eigenvalue Method" },
                { id: "deep-qr-eigen-method", title: "Deep Dive: QR Iteration", parent: "qr-eigen-method", deepDive: true },
                { id: "deep-orthogonality", title: "Deep Dive: Why Orthogonality Helps", parent: "qr-factorization", deepDive: true }
            ],
            matlabBlocks: {
                qr_intro: "A = [1 2; 3 4; 5 6]\n[Q, R] = qr(A)\nQ' * Q",
                least_squares_demo: "A = [1 1; 1 2; 1 3]\nb = [1; 2; 2]\nx = A \\ b",
                eig_demo: "A = [2 1; 1 2]\nlambda = eig(A)",
                power_demo: "A = [2 1; 1 2]\nx = [1; 0]\ny = A*x\nlambda = (x' * A * x) / (x' * x)",
                qr_eig_demo: "A = [2 1; 1 2]\n[Q, R] = qr(A)\nA1 = R * Q\neig(A)"
            },
            html: `
                <section id="qr-factorization">
                    <h2>QR Factorization</h2>
                    <p>QR factorization writes a matrix as \\(A=QR\\). The matrix \\(Q\\) contains perpendicular unit-length directions, and \\(R\\) is upper triangular.</p>
                    <p>The point of QR is to replace a difficult matrix by a length-preserving part and a triangular part. Before running the code, expect <code>Q' * Q</code> to behave like an identity matrix.</p>
                    <!-- TODO animation: show columns being orthogonalized and lengths preserved by Q. -->
                    <div class="matlab-block">
                        <pre>A = [1 2; 3 4; 5 6]
[Q, R] = qr(A)
Q' * Q</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="qr_intro">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-qr-construction" class="deep-dive">
                    <h2>Deep Dive: Constructing Q and R</h2>
                    <p>One way to understand QR is Gram-Schmidt orthogonalization. Start with the columns of \\(A\\). Keep the first direction, then remove from the next column the part already explained by the previous directions.</p>
                    <p>The entries of \\(R\\) record how much of each old direction was removed or kept. The columns of \\(Q\\) are the cleaned, normalized directions.</p>
                    <p>In exact arithmetic, \\(Q^TQ=I\\). Numerically, QR is useful because orthogonal transformations do not magnify vector lengths.</p>
                    <p>QR turns columns into an orthonormal coordinate system plus triangular coefficients.</p>
                </section>

                <section id="deep-orthogonality" class="deep-dive">
                    <h2>Deep Dive: Why Orthogonality Helps</h2>
                    <p>If \\(Q\\) is orthogonal, then \\(Q^TQ=I\\), and \\(\\|Qx\\|_2=\\|x\\|_2\\). This means orthogonal transformations do not stretch error vectors.</p>
                    <p>That matters numerically because a method that preserves lengths is less likely to amplify rounding errors accidentally.</p>
                    <p>QR is trusted because orthogonal transformations are gentle on errors.</p>
                </section>

                <section id="least-squares">
                    <h2>Least Squares</h2>
                    <p>Sometimes \\(Ax=b\\) has more equations than unknowns, so no exact solution fits every equation. Least squares chooses the vector \\(x\\) that makes the residual \\(Ax-b\\) as small as possible.</p>
                    <p>Before running the code, expect MATLAB to return the best fit, not a vector that makes every equation exact.</p>
                    <div class="matlab-block">
                        <pre>A = [1 1; 1 2; 1 3]
b = [1; 2; 2]
x = A \\ b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="least_squares_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-least-squares" class="deep-dive">
                    <h2>Deep Dive: Normal Equations and QR</h2>
                    <p>The least-squares problem minimizes \\(\\|Ax-b\\|_2\\). Geometrically, the best approximation is the projection of \\(b\\) onto the column space of \\(A\\).</p>
                    <p>The normal equations are</p>
                    <p>$$ A^TAx=A^Tb. $$</p>
                    <p>They describe the condition that the residual is perpendicular to every column of \\(A\\). QR is often preferred computationally because it solves the same fitting problem without unnecessarily worsening conditioning.</p>
                    <p>Least squares is projection; QR is a stable way to compute it.</p>
                </section>

                <section id="eigenvalues">
                    <h2>Eigenvalues</h2>
                    <p>An eigenvector keeps its direction under multiplication by \\(A\\). The scalar stretching factor is the eigenvalue:</p>
                    <p>$$ Av=\\lambda v $$</p>
                    <p>Eigenvalues reveal stability, oscillation, convergence, and geometry of a linear transformation.</p>
                    <div class="matlab-block">
                        <pre>A = [2 1; 1 2]
lambda = eig(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="eig_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-eigenvalues" class="deep-dive">
                    <h2>Deep Dive: Characteristic Equation</h2>
                    <p>The equation \\(Av=\\lambda v\\) can be rewritten as</p>
                    <p>$$ (A-\\lambda I)v=0. $$</p>
                    <p>For a nonzero eigenvector to exist, the matrix \\(A-\\lambda I\\) must be singular. Therefore eigenvalues satisfy</p>
                    <p>$$ \\det(A-\\lambda I)=0. $$</p>
                    <p>This determinant equation explains the theory. Numerical algorithms usually do not find eigenvalues by expanding the determinant directly, because that is unstable and expensive for large matrices.</p>
                    <p>The characteristic equation defines eigenvalues, while algorithms compute them more carefully.</p>
                </section>

                <section id="power-method">
                    <h2>Power Method</h2>
                    <p>The power method approximates the largest eigenvalue in magnitude. Start with a vector, multiply by \\(A\\), then normalize. Repeating this tends to align the vector with the dominant eigenvector.</p>
                    <p>The MATLAB block shows one step and the Rayleigh quotient estimate of the eigenvalue.</p>
                    <!-- TODO animation: show a vector repeatedly transformed by A and rotating toward the dominant eigenvector. -->
                    <div class="matlab-block">
                        <pre>A = [2 1; 1 2]
x = [1; 0]
y = A*x
lambda = (x' * A * x) / (x' * x)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="power_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-power-method" class="deep-dive">
                    <h2>Deep Dive: Why Power Iteration Converges</h2>
                    <p>If \\(A\\) has eigenvectors \\(v_1,\\ldots,v_n\\), an initial vector can be written as a combination of them. Multiplying by \\(A\\) scales each eigenvector component by its eigenvalue.</p>
                    <p>After many multiplications, the component with the largest absolute eigenvalue usually dominates. Normalization keeps the vector from growing without bound.</p>
                    <p>The Rayleigh quotient</p>
                    <p>$$ \\lambda \\approx \\frac{x^TAx}{x^Tx} $$</p>
                    <p>turns the current vector into an eigenvalue estimate.</p>
                    <p>Power iteration works by repeatedly amplifying the dominant eigenvector component.</p>
                </section>

                <section id="inverse-power">
                    <h2>Inverse Power Method</h2>
                    <p>The inverse power method applies the power idea to \\(A^{-1}\\), making it useful for approximating the eigenvalue closest to zero. With shifts, it can target eigenvalues near a chosen number.</p>
                    <p>In practice, each step solves a linear system rather than explicitly forming \\(A^{-1}\\).</p>
                </section>

                <section id="deep-inverse-power" class="deep-dive">
                    <h2>Deep Dive: Shifts and Targeting</h2>
                    <p>If \\(Av=\\lambda v\\), then \\((A-\\mu I)v=(\\lambda-\\mu)v\\). Applying inverse iteration to \\(A-\\mu I\\) makes eigenvalues near \\(\\mu\\) become large after inversion.</p>
                    <p>That is why shifted inverse iteration can target an eigenvalue near a chosen number \\(\\mu\\).</p>
                    <p>Shifts move the eigenvalue you want into a position where inverse iteration can find it.</p>
                </section>

                <section id="qr-eigen-method">
                    <h2>QR Method for Eigenvalues</h2>
                    <p>The QR eigenvalue method repeatedly performs QR factorization and rebuilds the matrix in the reversed order. The diagonal values gradually approach eigenvalues for many matrices.</p>
                    <p>The code shows one QR step. Full eigenvalue algorithms repeat this step many times with refinements.</p>
                    <!-- TODO animation: show repeated A_k -> Q_k R_k -> R_k Q_k steps and diagonal entries stabilizing. -->
                    <div class="matlab-block">
                        <pre>A = [2 1; 1 2]
[Q, R] = qr(A)
A1 = R * Q
eig(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="qr_eig_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-qr-eigen-method" class="deep-dive">
                    <h2>Deep Dive: QR Iteration</h2>
                    <p>Starting from \\(A_0=A\\), QR iteration computes</p>
                    <p>$$ A_k=Q_kR_k,\\qquad A_{k+1}=R_kQ_k. $$</p>
                    <p>The matrices \\(A_k\\) are similar to each other, so they have the same eigenvalues. Under suitable conditions, the off-diagonal entries become small and the diagonal entries reveal the eigenvalues.</p>
                    <p>Practical QR algorithms use shifts to improve convergence.</p>
                    <p>QR iteration preserves eigenvalues while transforming the matrix toward a form where they are visible.</p>
                </section>
            `
        },
        {
            id: "svd",
            title: "Singular Value Decomposition",
            shortTitle: "SVD",
            kicker: "Chapter 5",
            folder: "5. svd",
            sections: [
                { id: "svd-factorization", title: "SVD Factorization", navTitle: "SVD Factorization" },
                { id: "deep-svd-factorization", title: "Deep Dive: From Eigenvalues to SVD", parent: "svd-factorization", deepDive: true },
                { id: "geometry", title: "Geometry of SVD", navTitle: "Geometry" },
                { id: "deep-svd-geometry", title: "Deep Dive: Geometry of a Matrix", parent: "geometry", deepDive: true },
                { id: "rank-condition", title: "Rank, Norm, and Conditioning", navTitle: "Rank and Conditioning" },
                { id: "deep-svd-rank", title: "Deep Dive: Rank and Condition Number", parent: "rank-condition", deepDive: true },
                { id: "pseudoinverse", title: "Pseudoinverse", navTitle: "Pseudoinverse" },
                { id: "deep-pseudoinverse", title: "Deep Dive: Building the Pseudoinverse", parent: "pseudoinverse", deepDive: true },
                { id: "applications", title: "Applications", navTitle: "Applications" },
                { id: "deep-svd-applications", title: "Deep Dive: Low-Rank Approximation", parent: "applications", deepDive: true }
            ],
            matlabBlocks: {
                svd_intro: "A = [1 2; 3 4; 5 6]\n[U, S, V] = svd(A)",
                svd_values: "A = [1 2; 3 4; 5 6]\ns = svd(A)\nrank(A)\ncond(A)",
                pinv_demo: "A = [1 2; 3 4; 5 6]\nb = [1; 0; 1]\nx = pinv(A) * b",
                low_rank_demo: "A = [3 0; 0 1]\n[U, S, V] = svd(A)\nS"
            },
            html: `
                <section id="svd-factorization">
                    <h2>SVD Factorization</h2>
                    <p>The singular value decomposition, or SVD, factors any real matrix into three simpler parts: input directions, stretch factors, and output directions. Unlike eigenvalue decomposition, SVD works for rectangular matrices too, not only square matrices.</p>
                    <p>If \\(A\\) is \\(m\\times n\\), then MATLAB's full SVD has the shape</p>
                    <p>$$ A=USV^T,\\qquad U:m\\times m,\\quad S:m\\times n,\\quad V:n\\times n. $$</p>
                    <p>The middle matrix <code>S</code> is the most informative part. It is rectangular like <code>A</code>, but almost all of its entries are zero. Its diagonal contains the singular values: nonnegative stretch factors usually listed from largest to smallest.</p>
                    <p>The nonzero diagonal values in <code>S</code> count the independent directions of the matrix. In other words, the rank of \\(A\\) is the number of nonzero singular values.</p>
                    <p>For a visual explanation, this video is especially useful:</p>
                    <div class="video-embed">
                        <p>Optional video explanation (internet required): <a href="https://www.youtube.com/watch?v=vSczTbgc8Rc" target="_blank" rel="noopener">Watch on YouTube</a>.</p><iframe src="https://www.youtube-nocookie.com/embed/vSczTbgc8Rc" title="SVD visual explanation" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>
                    <div class="matlab-block">
                        <pre>A = [1 2; 3 4; 5 6]
[U, S, V] = svd(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="svd_intro">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-svd-factorization" class="deep-dive">
                    <h2>Deep Dive: From Eigenvalues to SVD</h2>
                    <p>The full formula is</p>
                    <p>$$ A=U\\Sigma V^T. $$</p>
                    <p>The columns of \\(V\\) are right singular vectors, the columns of \\(U\\) are left singular vectors, and \\(\\Sigma\\), shown as <code>S</code> in MATLAB, stores singular values. If \\(A\\) is rectangular, \\(\\Sigma\\) is rectangular too: its diagonal carries the singular values, while the extra rows or columns are zero padding.</p>
                    <p>The singular values of \\(A\\) are the square roots of the eigenvalues of \\(A^TA\\):</p>
                    <p>$$ A^TA v_i=\\sigma_i^2 v_i. $$</p>
                    <p>When \\(\\sigma_i>0\\), the left singular vector is obtained from \\(Av_i=\\sigma_i u_i\\).</p>
                    <p>Zero singular values mean directions that are collapsed. Counting the nonzero \\(\\sigma_i\\)'s gives the rank. This is why <code>S</code> is not just a scaling matrix; it is also a compact summary of dimension, rank, and numerical weakness.</p>
                    <p>SVD extends eigenvalue ideas to any rectangular matrix.</p>
                </section>

                <section id="geometry">
                    <h2>Geometry of SVD</h2>
                    <p>Geometrically, SVD says that a matrix first chooses special perpendicular input directions, then stretches them, then rotates or reflects the result into output space.</p>
                    <p>For the diagonal example below, the directions are already aligned with the coordinate axes, so <code>S</code> directly shows the stretching.</p>
                    <!-- TODO animation: morph the unit circle into an ellipse using V^T, Sigma, then U. -->
                    <div class="matlab-block">
                        <pre>A = [3 0; 0 1]
[U, S, V] = svd(A)
S</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="low_rank_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-svd-geometry" class="deep-dive">
                    <h2>Deep Dive: Geometry of a Matrix</h2>
                    <p>Think of a matrix as transforming all vectors in space. SVD decomposes this transformation into three stages:</p>
                    <p>$$ x \\mapsto V^Tx \\mapsto \\Sigma V^Tx \\mapsto U\\Sigma V^Tx. $$</p>
                    <p>The middle stage is the easiest: it scales coordinate axes by the singular values. The matrices \\(U\\) and \\(V\\) are orthogonal, so they change direction without changing lengths.</p>
                    <p>SVD reveals the hidden axes along which a matrix stretches space.</p>
                </section>

                <section id="rank-condition">
                    <h2>Rank, Norm, and Conditioning</h2>
                    <p>Singular values summarize important matrix properties. Nonzero singular values count independent directions, so they determine the rank. The largest singular value tells the biggest stretch. A tiny smallest singular value warns that the matrix is close to losing rank.</p>
                    <p>Before running the block, expect <code>svd</code>, <code>rank</code>, and <code>cond</code> to describe the same matrix from different angles.</p>
                    <div class="matlab-block">
                        <pre>A = [1 2; 3 4; 5 6]
s = svd(A)
rank(A)
cond(A)</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="svd_values">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-svd-rank" class="deep-dive">
                    <h2>Deep Dive: Rank and Condition Number</h2>
                    <p>The rank is the number of nonzero singular values. Numerically, very small singular values behave like weak directions: the matrix almost collapses those directions.</p>
                    <p>For the 2-norm,</p>
                    <p>$$ \\|A\\|_2=\\sigma_{\\max}. $$</p>
                    <p>If the matrix has full column rank, the 2-norm condition number is</p>
                    <p>$$ \\kappa_2(A)=\\frac{\\sigma_{\\max}}{\\sigma_{\\min}}. $$</p>
                    <p>Singular values show both the strength and fragility of a matrix.</p>
                </section>

                <section id="pseudoinverse">
                    <h2>Pseudoinverse</h2>
                    <p>The pseudoinverse generalizes the inverse to rectangular or rank-deficient matrices. It gives a stable way to compute least-squares or minimum-norm solutions.</p>
                    <p>Before running the block, expect <code>pinv(A) * b</code> to produce a best-fit solution even though \\(A\\) is not square.</p>
                    <div class="matlab-block">
                        <pre>A = [1 2; 3 4; 5 6]
b = [1; 0; 1]
x = pinv(A) * b</pre>
                        <div class="block-actions">
                            <button class="load-matlab" data-code-id="pinv_demo">Load in MATLAB</button>
                        </div>
                    </div>
                </section>

                <section id="deep-pseudoinverse" class="deep-dive">
                    <h2>Deep Dive: Building the Pseudoinverse</h2>
                    <p>Using SVD, the pseudoinverse is</p>
                    <p>$$ A^+=V\\Sigma^+U^T. $$</p>
                    <p>The matrix \\(\\Sigma^+\\) is made by replacing each nonzero singular value \\(\\sigma_i\\) with \\(1/\\sigma_i\\), then transposing the rectangular diagonal shape.</p>
                    <p>Small singular values are dangerous because their reciprocals are large. This is why SVD is useful for diagnosing ill-conditioned least-squares problems.</p>
                    <p>The pseudoinverse solves by inverting only the singular directions that are meaningfully present.</p>
                </section>

                <section id="applications">
                    <h2>Applications</h2>
                    <p>The main applications are least-squares solutions, rank detection, compression or low-rank approximation, and robust handling of ill-conditioned matrices.</p>
                    <div class="math-card">
                        <strong>Practical lesson:</strong> SVD is usually more expensive than LU or QR, but it gives the most diagnostic information about a matrix.
                    </div>
                </section>

                <section id="deep-svd-applications" class="deep-dive">
                    <h2>Deep Dive: Low-Rank Approximation</h2>
                    <p>If singular values decrease quickly, the matrix can be approximated by keeping only the largest ones. This gives a lower-rank matrix that captures the dominant behavior.</p>
                    <p>The best rank-\\(k\\) approximation in the 2-norm is obtained by keeping the first \\(k\\) singular values and setting the rest to zero.</p>
                    <p>This is the mathematical idea behind compression: keep the strongest directions, discard weak ones.</p>
                    <p>SVD ranks the importance of directions, which makes approximation systematic.</p>
                </section>
            `
        }
    ]
};
