/**
 * MATLAB-Lite Engine
 * A course-focused MATLAB syntax layer over math.js.
 */

const MatlabEngine = (function() {
    let workspace = {};
    let outputFormat = "short";

    const helpTopics = {
        clear: "clear removes variables from the workspace. clear A removes A. clear all resets MATLAB-Lite.",
        clc: "clc clears the Command Window.",
        format: "format short displays about 4 digits. format long displays about 15 digits.",
        clearvars: "clearvars removes variables from the workspace. clearvars A removes A.",
        whos: "whos lists variables in the workspace with their size, bytes, and class.",
        lu: "[L,U] = lu(A) or [L,U,P] = lu(A) factors A using LU decomposition.",
        qr: "[Q,R] = qr(A) factors A into an orthogonal Q and upper triangular R.",
        svd: "svd(A) returns singular values. [U,S,V] = svd(A) gives A = U*S*V'.",
        eig: "eig(A) returns eigenvalues of A.",
        chol: "chol(A) returns an upper triangular Cholesky factor R where R'*R = A.",
        cond: "cond(A) estimates how sensitive A is to numerical error.",
        norm: "norm(A) returns the vector or matrix norm.",
        spdiags: "spdiags(B,d,m,n) builds a sparse-style banded matrix. MATLAB-Lite returns a full matrix.",
        gallery: "gallery('tridiag',n) creates a standard tridiagonal matrix with -1, 2, -1 diagonals.",
        lagrange: "lagrange(x,y,xq) evaluates the Lagrange interpolating polynomial through points (x,y) at query points xq.",
        newtoninterp: "newtoninterp(x,y,xq) evaluates the Newton divided-difference interpolating polynomial through points (x,y) at xq."
    };

    const functionNames = new Set([
        "abs", "acos", "asin", "atan", "ceil", "chol", "cond", "cos", "det", "diag", "eig", "exp", "eye",
        "fix", "floor", "full", "gallery", "hilb", "inv", "linspace", "log", "lu", "max", "mean", "min", "norm",
        "axis", "figure", "hold", "lagrange", "newtoninterp", "ones", "pinv", "plot", "polyder", "polyfit", "polyval", "prod", "qr", "rank", "round",
        "sin", "spline", "sqrt", "std", "subplot", "sum", "surf", "surface", "svd", "tan", "title", "transpose", "xlabel", "ylabel", "zeros"
    ]);

    const nativeDiag = math.diag.bind(math);
    const nativeOnes = math.ones.bind(math);
    const nativeZeros = math.zeros.bind(math);
    const nativeNumeric = {
        abs: Math.abs,
        acos: Math.acos,
        asin: Math.asin,
        atan: Math.atan,
        ceil: Math.ceil,
        cos: Math.cos,
        exp: Math.exp,
        fix: Math.trunc,
        floor: Math.floor,
        log: Math.log,
        round: Math.round,
        sin: Math.sin,
        sqrt: Math.sqrt,
        tan: Math.tan
    };

    let figureSerial = 0;
    let currentFigureId = null;
    let holdState = false;
    let currentSubplot = { rows: 1, cols: 1, index: 1 };

    function toArray(value) {
        return value && value.toArray ? value.toArray() : value;
    }

    function isTransposeQuote(input, index) {
        if (input[index] !== "'") return false;
        const previous = input.slice(0, index).trimEnd().slice(-1);
        return Boolean(previous && /[\w\]\)]/.test(previous));
    }

    function asMatrix(value) {
        return value && value.toArray ? value : math.matrix(value);
    }

    function flatten(value) {
        const arr = toArray(value);
        return Array.isArray(arr) ? arr.flat(Infinity) : [arr];
    }

    function isMatrixLike(value) {
        return Boolean(value && value.toArray) || Array.isArray(value);
    }

    function isScalarNumber(value) {
        return typeof value === "number";
    }

    function mldivide(A, b) {
        if (isScalarNumber(A)) return math.divide(b, A);
        const left = asMatrix(A);
        const right = asMatrix(b);
        const size = left.size();
        if (size.length === 2 && size[0] !== size[1]) {
            const leftT = math.transpose(left);
            return math.lusolve(math.multiply(leftT, left), math.multiply(leftT, right));
        }
        return math.lusolve(left, right);
    }

    function mrdivide(b, A) {
        if (isScalarNumber(A)) return math.divide(b, A);
        const resultT = math.lusolve(math.transpose(asMatrix(A)), math.transpose(asMatrix(b)));
        return math.transpose(resultT);
    }

    function qrDecomposition(A) {
        const a = toArray(A);
        const m = a.length;
        const n = a[0].length;
        const qCols = [];
        const r = Array.from({ length: n }, () => Array(n).fill(0));

        for (let j = 0; j < n; j++) {
            let v = a.map(row => row[j]);
            for (let i = 0; i < j; i++) {
                r[i][j] = math.dot(qCols[i], v);
                v = math.subtract(v, math.multiply(r[i][j], qCols[i]));
            }
            r[j][j] = math.norm(v);
            qCols[j] = r[j][j] === 0 ? Array(m).fill(0) : math.divide(v, r[j][j]);
        }

        return {
            Q: math.transpose(qCols),
            R: r
        };
    }

    function eigenvalues(A) {
        if (!math.eigs) throw new Error("eig is not available in this browser.");
        return flatten(math.eigs(A).values).map(value => {
            const real = value && typeof value === "object" && "re" in value ? value.re : value;
            const imaginary = value && typeof value === "object" && "im" in value ? value.im : 0;
            return Math.abs(imaginary) < 1e-12 ? real : value;
        });
    }

    function singularValues(A) {
        const ata = toArray(math.multiply(math.transpose(A), A));
        return symmetricEigenvalues(ata)
            .map(value => Math.sqrt(Math.max(0, value)))
            .sort((a, b) => b - a);
    }

    function symmetricEigenvalues(matrix) {
        const a = matrix.map(row => row.map(Number));
        const n = a.length;
        const maxIterations = Math.max(50, n * n * 40);

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            let p = 0;
            let q = 1;
            let max = 0;

            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const value = Math.abs(a[i][j]);
                    if (value > max) {
                        max = value;
                        p = i;
                        q = j;
                    }
                }
            }

            if (max < 1e-12) break;

            const angle = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const app = c * c * a[p][p] - 2 * s * c * a[p][q] + s * s * a[q][q];
            const aqq = s * s * a[p][p] + 2 * s * c * a[p][q] + c * c * a[q][q];

            for (let k = 0; k < n; k++) {
                if (k === p || k === q) continue;
                const akp = a[k][p];
                const akq = a[k][q];
                a[k][p] = c * akp - s * akq;
                a[p][k] = a[k][p];
                a[k][q] = s * akp + c * akq;
                a[q][k] = a[k][q];
            }

            a[p][p] = app;
            a[q][q] = aqq;
            a[p][q] = 0;
            a[q][p] = 0;
        }

        return a.map((row, i) => row[i]);
    }

    function svdDecomposition(A) {
        const values = singularValues(A);
        const m = toArray(A).length;
        const n = toArray(A)[0].length;
        const size = Math.min(m, n);
        const s = nativeZeros(m, n).toArray();
        for (let i = 0; i < size; i++) s[i][i] = values[i] || 0;

        return {
            U: math.identity(m),
            S: s,
            V: math.identity(n),
            values
        };
    }

    function pseudoInverse(A) {
        const matrix = asMatrix(A);
        const size = matrix.size();
        const AT = math.transpose(matrix);
        if (size[0] >= size[1]) {
            return math.multiply(math.inv(math.multiply(AT, matrix)), AT);
        }
        return math.multiply(AT, math.inv(math.multiply(matrix, AT)));
    }

    function spdiags(B, d, m, n) {
        const bands = toArray(B);
        const offsets = flatten(d).map(Number);
        const matrix = Array.from({ length: m }, () => Array(n).fill(0));

        if (!Array.isArray(bands[0])) {
            offsets.forEach((offset, k) => {
                for (let row = 0; row < m; row++) {
                    const col = row + offset;
                    if (col >= 0 && col < n) matrix[row][col] = bands[k] ?? bands[0] ?? 0;
                }
            });
            return matrix;
        }

        offsets.forEach((offset, k) => {
            for (let row = 0; row < m; row++) {
                const col = row + offset;
                if (col >= 0 && col < n) matrix[row][col] = bands[row]?.[k] ?? 0;
            }
        });
        return matrix;
    }

    function gallery(name, n) {
        const key = String(name).replace(/^["']|["']$/g, "").toLowerCase();
        if (key !== "tridiag") {
            throw new Error(`gallery option '${name}' is not implemented in MATLAB-Lite yet.`);
        }
        const matrix = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            matrix[i][i] = 2;
            if (i > 0) matrix[i][i - 1] = -1;
            if (i < n - 1) matrix[i][i + 1] = -1;
        }
        return matrix;
    }

    function hilb(n) {
        return Array.from({ length: n }, (_, row) =>
            Array.from({ length: n }, (_, col) => 1 / (row + col + 1))
        );
    }

    function diag(v, k = 0) {
        const arr = toArray(v);
        const offset = Number(k);
        if (Array.isArray(arr) && Array.isArray(arr[0])) {
            const rows = arr.length;
            const cols = arr[0].length;
            const values = [];
            for (let row = 0; row < rows; row++) {
                const col = row + offset;
                if (col >= 0 && col < cols) values.push(arr[row][col]);
            }
            return values;
        }

        const values = flatten(arr);
        const size = values.length + Math.abs(offset);
        const matrix = Array.from({ length: size }, () => Array(size).fill(0));
        values.forEach((value, index) => {
            const row = offset >= 0 ? index : index - offset;
            const col = offset >= 0 ? index + offset : index;
            matrix[row][col] = value;
        });
        return matrix;
    }

    function customSvd(A) {
        const result = svdDecomposition(A);
        return {
            U: result.U,
            S: result.S,
            V: result.V,
            values: result.values
        };
    }

    math.import({
        linspace: (start, end, n = 100) => {
            if (n <= 1) return [end];
            const step = (end - start) / (n - 1);
            return Array.from({ length: n }, (_, i) => start + i * step);
        },
        zeros: (r, c = r) => nativeZeros(r, c),
        ones: (r, c = r) => nativeOnes(r, c),
        eye: n => math.identity(n),
        inf: Infinity,
        hilb,
        diag,
        rank: A => {
            const s = singularValues(A);
            const tolerance = 1e-10;
            return s.filter(v => Math.abs(v) > tolerance).length;
        },
        cond: A => {
            const s = singularValues(A);
            const nonzero = s.filter(v => v > 1e-12);
            if (!nonzero.length) return Infinity;
            return Math.max(...nonzero) / Math.min(...nonzero);
        },
        lu: luDecomposition,
        qr: qrDecomposition,
        eig: eigenvalues,
        svd: customSvd,
        pinv: pseudoInverse,
        chol: choleskyUpper,
        lagrange: lagrangeInterpolation,
        newtoninterp: newtonInterpolation,
        polyfit,
        polyder,
        polyval,
        spline,
        mldivide,
        mrdivide,
        elementTimes,
        elementDivide,
        elementPower,
        spdiags,
        full: A => A,
        gallery,
        colon,
        matlabIndex,
        max: x => Math.max(...flatten(x).map(Number)),
        min: x => Math.min(...flatten(x).map(Number)),
        abs: x => mapNumeric(x, nativeNumeric.abs),
        acos: x => mapNumeric(x, nativeNumeric.acos),
        asin: x => mapNumeric(x, nativeNumeric.asin),
        atan: x => mapNumeric(x, nativeNumeric.atan),
        ceil: x => mapNumeric(x, nativeNumeric.ceil),
        cos: x => mapNumeric(x, nativeNumeric.cos),
        exp: x => mapNumeric(x, nativeNumeric.exp),
        fix: x => mapNumeric(x, nativeNumeric.fix),
        floor: x => mapNumeric(x, nativeNumeric.floor),
        log: x => mapNumeric(x, nativeNumeric.log),
        round: x => mapNumeric(x, nativeNumeric.round),
        sin: x => mapNumeric(x, nativeNumeric.sin),
        sqrt: x => mapNumeric(x, nativeNumeric.sqrt),
        tan: x => mapNumeric(x, nativeNumeric.tan)
    }, { override: true });

    function choleskyUpper(A) {
        const a = toArray(A);
        const n = a.length;
        const l = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) sum += l[i][k] * l[j][k];
                if (i === j) {
                    const value = a[i][i] - sum;
                    if (value <= 0) throw new Error("Matrix must be positive definite.");
                    l[i][j] = Math.sqrt(value);
                } else {
                    l[i][j] = (a[i][j] - sum) / l[j][j];
                }
            }
        }
        return math.transpose(l);
    }

    function mapNumeric(value, fn) {
        const arr = toArray(value);
        if (Array.isArray(arr)) {
            return arr.map(item => mapNumeric(item, fn));
        }
        return fn(value);
    }

    function elementBinary(left, right, fn) {
        const a = toArray(left);
        const b = toArray(right);
        const aIsArray = Array.isArray(a);
        const bIsArray = Array.isArray(b);
        if (!aIsArray && !bIsArray) return fn(Number(a), Number(b));
        if (aIsArray && !bIsArray) return a.map(item => elementBinary(item, b, fn));
        if (!aIsArray && bIsArray) return b.map(item => elementBinary(a, item, fn));
        return a.map((item, index) => elementBinary(item, b[index] ?? b[0], fn));
    }

    function elementTimes(left, right) {
        return elementBinary(left, right, (a, b) => a * b);
    }

    function elementDivide(left, right) {
        return elementBinary(left, right, (a, b) => a / b);
    }

    function elementPower(left, right) {
        return elementBinary(left, right, (a, b) => Math.pow(a, b));
    }

    function luDecomposition(A) {
        const U = toArray(A).map(row => row.slice());
        const n = U.length;
        const L = math.identity(n).toArray();
        const P = math.identity(n).toArray();

        for (let k = 0; k < n; k++) {
            let pivot = k;
            let max = Math.abs(U[k][k]);
            for (let i = k + 1; i < n; i++) {
                if (Math.abs(U[i][k]) > max) {
                    max = Math.abs(U[i][k]);
                    pivot = i;
                }
            }

            if (max === 0) throw new Error("Matrix is singular to working precision.");

            if (pivot !== k) {
                [U[k], U[pivot]] = [U[pivot], U[k]];
                [P[k], P[pivot]] = [P[pivot], P[k]];
                for (let j = 0; j < k; j++) {
                    [L[k][j], L[pivot][j]] = [L[pivot][j], L[k][j]];
                }
            }

            for (let i = k + 1; i < n; i++) {
                L[i][k] = U[i][k] / U[k][k];
                for (let j = k; j < n; j++) {
                    U[i][j] -= L[i][k] * U[k][j];
                    if (Math.abs(U[i][j]) < 1e-12) U[i][j] = 0;
                }
            }
        }

        return { L, U, P };
    }

    function polyfit(x, y, n) {
        const xArr = flatten(x);
        const yArr = flatten(y);
        const X = xArr.map(xi => Array.from({ length: n + 1 }, (_, i) => Math.pow(xi, n - i)));
        const XT = math.transpose(X);
        const p = math.lusolve(math.multiply(XT, X), math.multiply(XT, yArr));
        return flatten(p);
    }

    function lagrangeInterpolation(x, y, xq) {
        const xArr = flatten(x).map(Number);
        const yArr = flatten(y).map(Number);
        if (xArr.length !== yArr.length || xArr.length < 1) {
            throw new Error("lagrange expects x and y vectors with the same length.");
        }

        const queries = isMatrixLike(xq) ? flatten(xq).map(Number) : [Number(xq)];
        const result = queries.map(value => {
            let total = 0;
            for (let j = 0; j < xArr.length; j++) {
                let basis = 1;
                for (let m = 0; m < xArr.length; m++) {
                    if (m === j) continue;
                    basis *= (value - xArr[m]) / (xArr[j] - xArr[m]);
                }
                total += yArr[j] * basis;
            }
            return total;
        });

        return isMatrixLike(xq) ? result : result[0];
    }

    function newtonInterpolation(x, y, xq) {
        const xArr = flatten(x).map(Number);
        const coeffs = flatten(y).map(Number);
        if (xArr.length !== coeffs.length || xArr.length < 1) {
            throw new Error("newtoninterp expects x and y vectors with the same length.");
        }

        for (let order = 1; order < coeffs.length; order++) {
            for (let i = coeffs.length - 1; i >= order; i--) {
                coeffs[i] = (coeffs[i] - coeffs[i - 1]) / (xArr[i] - xArr[i - order]);
            }
        }

        const queries = isMatrixLike(xq) ? flatten(xq).map(Number) : [Number(xq)];
        const result = queries.map(value => {
            let total = coeffs[coeffs.length - 1];
            for (let i = coeffs.length - 2; i >= 0; i--) {
                total = total * (value - xArr[i]) + coeffs[i];
            }
            return total;
        });

        return isMatrixLike(xq) ? result : result[0];
    }

    function polyder(p) {
        const coeffs = flatten(p);
        const degree = coeffs.length - 1;
        if (degree <= 0) return [0];
        return coeffs.slice(0, -1).map((value, index) => value * (degree - index));
    }

    function polyval(p, x) {
        const pArr = flatten(p);
        const xArr = isMatrixLike(x) ? flatten(x) : [x];
        const result = xArr.map(xi => pArr.reduce((acc, c, i) => acc + c * Math.pow(xi, pArr.length - 1 - i), 0));
        return isMatrixLike(x) ? result : result[0];
    }

    function spline(x, y, xx) {
        const xArr = flatten(x);
        const yArr = flatten(y);
        if (xArr.length !== yArr.length || xArr.length < 2) {
            throw new Error("spline expects x and y vectors with the same length.");
        }
        const n = xArr.length - 1;
        const h = Array.from({ length: n }, (_, i) => xArr[i + 1] - xArr[i]);
        if (h.some(step => step <= 0)) throw new Error("spline expects x values in increasing order.");

        const alpha = Array(n + 1).fill(0);
        for (let i = 1; i < n; i++) {
            alpha[i] = (3 / h[i]) * (yArr[i + 1] - yArr[i]) - (3 / h[i - 1]) * (yArr[i] - yArr[i - 1]);
        }

        const l = Array(n + 1).fill(0);
        const mu = Array(n + 1).fill(0);
        const z = Array(n + 1).fill(0);
        const c = Array(n + 1).fill(0);
        const b = Array(n).fill(0);
        const d = Array(n).fill(0);
        l[0] = 1;

        for (let i = 1; i < n; i++) {
            l[i] = 2 * (xArr[i + 1] - xArr[i - 1]) - h[i - 1] * mu[i - 1];
            mu[i] = h[i] / l[i];
            z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
        }

        l[n] = 1;
        for (let j = n - 1; j >= 0; j--) {
            c[j] = z[j] - mu[j] * c[j + 1];
            b[j] = (yArr[j + 1] - yArr[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
            d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        }

        const query = isMatrixLike(xx) ? flatten(xx) : [xx];
        const result = query.map(value => {
            if (value <= xArr[0]) return yArr[0];
            if (value >= xArr[xArr.length - 1]) return yArr[yArr.length - 1];
            for (let i = 0; i < xArr.length - 1; i++) {
                if (value >= xArr[i] && value <= xArr[i + 1]) {
                    const dx = value - xArr[i];
                    return yArr[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
                }
            }
            return NaN;
        });
        return isMatrixLike(xx) ? result : result[0];
    }

    function colon(start, step, end) {
        const values = [];
        const direction = step >= 0 ? 1 : -1;
        for (let value = start; direction > 0 ? value <= end + 1e-12 : value >= end - 1e-12; value += step) {
            values.push(Number(value.toFixed(12)));
        }
        return values;
    }

    function matlabIndex(A, rowArg, colArg) {
        const arr = toArray(A);
        if (!Array.isArray(arr)) throw new Error("Array indices must be positive integers or logical values.");
        const matrix = Array.isArray(arr[0]) ? arr : [arr];

        if (colArg === undefined) {
            const flat = matrix.flat();
            const indices = resolveIndex(rowArg, flat.length);
            const result = indices.map(index => flat[index - 1]);
            return result.length === 1 ? result[0] : result;
        }

        const rows = resolveIndex(rowArg, matrix.length);
        const cols = resolveIndex(colArg, matrix[0].length);
        const result = rows.map(row => cols.map(col => matrix[row - 1][col - 1]));
        if (result.length === 1 && result[0].length === 1) return result[0][0];
        if (result.length === 1) return result[0];
        if (result[0].length === 1) return result.map(row => row[0]);
        return result;
    }

    function resolveIndex(index, max) {
        if (index === ":") return Array.from({ length: max }, (_, i) => i + 1);
        const values = flatten(index).map(Number);
        values.forEach(value => {
            if (!Number.isInteger(value) || value < 1 || value > max) {
                throw new Error("Array indices must be positive integers or logical values.");
            }
        });
        return values;
    }

    function splitStatements(input) {
        const statements = [];
        let current = "";
        let depth = 0;
        let quote = null;

        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            const next = input[i + 1];

            if (quote) {
                current += ch;
                if (ch === quote) quote = null;
                continue;
            }

            if ((ch === "'" && !isTransposeQuote(input, i)) || ch === '"') {
                quote = ch;
                current += ch;
                continue;
            }

            if (ch === "[" || ch === "(" || ch === "{") depth++;
            if (ch === "]" || ch === ")" || ch === "}") depth = Math.max(0, depth - 1);

            if ((ch === ";" || ch === "\n") && depth === 0) {
                statements.push({ text: current.trim(), suppress: ch === ";" });
                current = "";
                continue;
            }

            current += ch;
            if (ch === "\r" && next === "\n") i++;
        }

        if (current.trim()) statements.push({ text: current.trim(), suppress: false });
        return statements;
    }

    function stripComment(line) {
        let quote = null;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (quote) {
                if (ch === quote) quote = null;
                continue;
            }
            if ((ch === "'" && !isTransposeQuote(line, i)) || ch === '"') {
                quote = ch;
                continue;
            }
            if (ch === "%") return line.slice(0, i);
        }
        return line;
    }

    function preprocess(input) {
        return input
            .split(/\r?\n/)
            .map(stripComment)
            .join("\n")
            .trim();
    }

    function findTopLevelOperator(expr, operators) {
        let depth = 0;
        let quote = null;
        for (let i = expr.length - 1; i >= 0; i--) {
            const ch = expr[i];
            if (quote) {
                if (ch === quote) quote = null;
                continue;
            }
            if ((ch === "'" && !isTransposeQuote(expr, i)) || ch === '"') {
                quote = ch;
                continue;
            }
            if (ch === "]" || ch === ")" || ch === "}") depth++;
            if (ch === "[" || ch === "(" || ch === "{") depth--;
            if (depth === 0 && operators.includes(ch) && expr[i - 1] !== ".") return i;
        }
        return -1;
    }

    function stripOuterParens(expr) {
        const trimmed = expr.trim();
        if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) return trimmed;
        let depth = 0;
        for (let i = 0; i < trimmed.length; i++) {
            if (trimmed[i] === "(") depth++;
            if (trimmed[i] === ")") depth--;
            if (depth === 0 && i < trimmed.length - 1) return trimmed;
        }
        return stripOuterParens(trimmed.slice(1, -1));
    }

    function convertMatrixLiteral(content) {
        const rows = content.split(";").map(row => {
            const clean = row.trim().replace(/,/g, " ");
            const parts = clean.split(/\s+/).filter(Boolean);
            return `[${parts.join(",")}]`;
        });
        return `[${rows.join(",")}]`;
    }

    function convertMatrices(expr) {
        let out = "";
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] !== "[") {
                out += expr[i];
                continue;
            }
            let depth = 1;
            let j = i + 1;
            for (; j < expr.length; j++) {
                if (expr[j] === "[") depth++;
                if (expr[j] === "]") depth--;
                if (depth === 0) break;
            }
            const content = expr.slice(i + 1, j);
            out += convertMatrixLiteral(content);
            i = j;
        }
        return out;
    }

    function transformExpression(expr) {
        let transformed = stripOuterParens(expr);
        if (hasTopLevelPostfixTranspose(transformed)) {
            return `transpose(${transformExpression(transformed.slice(0, -1))})`;
        }
        const opIndex = findTopLevelOperator(transformed, ["\\", "/"]);
        if (opIndex > 0) {
            const left = transformExpression(transformed.slice(0, opIndex));
            const right = transformExpression(transformed.slice(opIndex + 1));
            return transformed[opIndex] === "\\"
                ? `mldivide(${left}, ${right})`
                : `mrdivide(${left}, ${right})`;
        }

        transformed = convertMatrices(transformed);
        transformed = transformed.replace(/([A-Za-z]\w*|\]|\))'/g, "transpose($1)");
        transformed = transformIndexing(transformed);
        transformed = transformColon(transformed);
        transformed = transformElementWise(transformed);
        return transformed;
    }

    function evaluateExpression(expression, scope = workspace) {
        const constants = new Set(['pi', 'eps', 'Inf', 'inf', 'NaN', 'nan', 'i', 'j', 'true', 'false']);
        const helpers = new Set(['mldivide', 'mrdivide', 'elementTimes', 'elementDivide', 'elementPower', 'colon', 'matlabIndex', 'spdiags']);
        math.parse(expression).traverse(node => {
            if (!node.isSymbolNode) return;
            const name = node.name;
            if (Object.prototype.hasOwnProperty.call(scope, name) || constants.has(name) || functionNames.has(name) || helpers.has(name)) return;
            throw new Error(`Undefined function or variable '${name}'.`);
        });
        return math.evaluate(expression, {eps: Number.EPSILON, Inf: Infinity, NaN, nan: NaN, j: math.complex(0, 1), ...scope});
    }

    function transformElementWise(expr) {
        let transformed = expr;
        [
            { op: ".^", fn: "elementPower" },
            { op: ".*", fn: "elementTimes" },
            { op: "./", fn: "elementDivide" }
        ].forEach(({ op, fn }) => {
            transformed = rewriteDotOperator(transformed, op, fn);
        });
        return transformed;
    }

    function rewriteDotOperator(expr, operator, fnName) {
        let out = expr;
        let index = findDotOperator(out, operator);
        while (index >= 0) {
            const leftStart = findOperandStart(out, index - 1);
            const rightEnd = findOperandEnd(out, index + operator.length);
            if (leftStart < 0 || rightEnd <= index + operator.length) break;
            const left = out.slice(leftStart, index).trim();
            const right = out.slice(index + operator.length, rightEnd).trim();
            out = `${out.slice(0, leftStart)}${fnName}(${left}, ${right})${out.slice(rightEnd)}`;
            index = findDotOperator(out, operator);
        }
        return out;
    }

    function findDotOperator(expr, operator) {
        let quote = null;
        for (let i = 0; i <= expr.length - operator.length; i++) {
            const ch = expr[i];
            if (quote) {
                if (ch === quote) quote = null;
                continue;
            }
            if ((ch === "'" && !isTransposeQuote(expr, i)) || ch === "\"") {
                quote = ch;
                continue;
            }
            if (expr.slice(i, i + operator.length) === operator) return i;
        }
        return -1;
    }

    function findOperandStart(expr, index) {
        let i = index;
        while (i >= 0 && /\s/.test(expr[i])) i--;
        if (i < 0) return -1;

        if (expr[i] === ")" || expr[i] === "]") {
            const open = matchingOpen(expr, i);
            if (open < 0) return -1;
            let start = open;
            let nameEnd = start - 1;
            while (nameEnd >= 0 && /\s/.test(expr[nameEnd])) nameEnd--;
            let nameStart = nameEnd;
            while (nameStart >= 0 && /[A-Za-z0-9_]/.test(expr[nameStart])) nameStart--;
            if (nameEnd >= 0 && /[A-Za-z_]/.test(expr[nameStart + 1] || "")) start = nameStart + 1;
            return start;
        }

        while (i >= 0 && /[A-Za-z0-9_.]/.test(expr[i])) i--;
        return i + 1;
    }

    function findOperandEnd(expr, index) {
        let i = index;
        while (i < expr.length && /\s/.test(expr[i])) i++;
        if (i >= expr.length) return i;

        if (expr[i] === "(" || expr[i] === "[") return matchingClose(expr, i) + 1;

        while (i < expr.length && /[A-Za-z0-9_.]/.test(expr[i])) i++;
        const afterName = i;
        while (i < expr.length && /\s/.test(expr[i])) i++;
        if (expr[i] === "(") return matchingClose(expr, i) + 1;
        return afterName;
    }

    function matchingOpen(expr, closeIndex) {
        const close = expr[closeIndex];
        const open = close === ")" ? "(" : "[";
        let depth = 0;
        for (let i = closeIndex; i >= 0; i--) {
            if (expr[i] === close) depth++;
            if (expr[i] === open) depth--;
            if (depth === 0) return i;
        }
        return -1;
    }

    function matchingClose(expr, openIndex) {
        const open = expr[openIndex];
        const close = open === "(" ? ")" : "]";
        let depth = 0;
        for (let i = openIndex; i < expr.length; i++) {
            if (expr[i] === open) depth++;
            if (expr[i] === close) depth--;
            if (depth === 0) return i;
        }
        return expr.length - 1;
    }

    function transformIndexing(expr) {
        let out = "";
        for (let i = 0; i < expr.length; i++) {
            const start = expr.slice(i).match(/^([A-Za-z]\w*)\s*\(/);
            if (!start) {
                out += expr[i];
                continue;
            }

            const name = start[1];
            const nameEnd = i + start[0].length;
            const openIndex = nameEnd - 1;
            const previous = expr[i - 1] || "";
            if (/[A-Za-z0-9_]/.test(previous) || functionNames.has(name) || typeof workspace[name] === "function" || !(name in workspace)) {
                out += expr[i];
                continue;
            }

            let depth = 1;
            let quote = null;
            let closeIndex = -1;
            for (let j = openIndex + 1; j < expr.length; j++) {
                const ch = expr[j];
                if (quote) {
                    if (ch === quote) quote = null;
                    continue;
                }
                if ((ch === "'" && !isTransposeQuote(expr, j)) || ch === "\"") {
                    quote = ch;
                    continue;
                }
                if (ch === "(" || ch === "[" || ch === "{") depth++;
                if (ch === ")" || ch === "]" || ch === "}") depth--;
                if (depth === 0) {
                    closeIndex = j;
                    break;
                }
            }

            if (closeIndex < 0) {
                out += expr[i];
                continue;
            }

            const args = expr.slice(openIndex + 1, closeIndex);
            const parts = splitTopLevelArgs(args).map(part => part.trim());
            const converted = parts.map(part => part === ":" ? `":"` : transformExpression(part));
            out += `matlabIndex(${name}, ${converted.join(", ")})`;
            i = closeIndex;
        }
        return out;
    }

    function hasTopLevelPostfixTranspose(expr) {
        if (!expr.endsWith("'")) return false;
        let depth = 0;
        let quote = null;
        for (let i = 0; i < expr.length - 1; i++) {
            const ch = expr[i];
            if (quote) {
                if (ch === quote) quote = null;
                continue;
            }
            if ((ch === "'" && !isTransposeQuote(expr, i)) || ch === "\"") {
                quote = ch;
                continue;
            }
            if (ch === "[" || ch === "(" || ch === "{") depth++;
            if (ch === "]" || ch === ")" || ch === "}") depth--;
        }
        return depth === 0 && !quote;
    }

    function transformColon(expr) {
        if (expr.includes("\"")) return expr;
        return expr.replace(/(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)/g, "colon($1,$2,$3)")
            .replace(/(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)/g, "colon($1,1,$2)");
    }

    function isAssignment(stmt) {
        return /(^|\s)(\[?[A-Za-z]\w*(?:\s*,\s*[A-Za-z]\w*)*\]?)\s*=/.test(stmt)
            && !/[<>!]=|==/.test(stmt);
    }

    function isIndexedAssignment(stmt) {
        return /^\s*[A-Za-z]\w*\s*\([^)]*\)\s*=/.test(stmt) && !/[<>!]=|==/.test(stmt);
    }

    function parseAssignment(stmt) {
        const match = stmt.match(/^\s*(\[?[A-Za-z]\w*(?:\s*,\s*[A-Za-z]\w*)*\]?)\s*=\s*([\s\S]+)$/);
        if (!match) return null;
        const left = match[1].trim();
        const right = match[2].trim();
        const names = left.startsWith("[")
            ? left.slice(1, -1).split(",").map(name => name.trim()).filter(Boolean)
            : [left];
        return { names, right };
    }

    function isAnonymousFunctionExpression(expr) {
        return /^@\s*\(/.test(expr.trim());
    }

    function createAnonymousFunction(expr) {
        const match = expr.trim().match(/^@\s*\(([^)]*)\)\s*([\s\S]+)$/);
        if (!match) throw new Error("Anonymous function syntax is @(x) expression.");
        const params = match[1].split(",").map(param => param.trim()).filter(Boolean);
        const body = match[2].trim();
        if (!params.length || params.some(param => !/^[A-Za-z]\w*$/.test(param))) {
            throw new Error("Anonymous function inputs must be valid variable names.");
        }
        if (!body) throw new Error("Anonymous function needs an expression body.");

        const captured = { ...workspace };
        const fn = (...args) => {
            if (args.length < params.length) throw new Error("Not enough input arguments.");
            const scope = { ...captured, ...workspace };
            params.forEach((param, index) => {
                scope[param] = args[index];
            });
            return evaluateExpression(transformExpression(body), scope);
        };
        fn.__matlabLiteFunction = true;
        fn.__matlabLiteDisplay = `@(${params.join(",")}) ${body}`;
        return fn;
    }

    function executeIndexedAssignment(stmt) {
        const match = stmt.match(/^\s*([A-Za-z]\w*)\s*\(([^)]*)\)\s*=\s*([\s\S]+)$/);
        if (!match) return null;

        const [, name, rawArgs, rawRight] = match;
        if (!(name in workspace)) throw new Error(`Undefined function or variable '${name}'.`);

        const target = toArray(workspace[name]);
        if (!Array.isArray(target)) throw new Error("Indexed assignment target must be an array.");

        const matrix = Array.isArray(target[0]) ? target.map(row => row.slice()) : [target.slice()];
        const args = splitTopLevelArgs(rawArgs).map(arg => arg.trim());
        const rows = resolveIndex(evaluateExpression(transformExpression(args[0]), workspace), matrix.length);
        const cols = args.length > 1
            ? resolveIndex(evaluateExpression(transformExpression(args[1]), workspace), matrix[0].length)
            : resolveIndex(evaluateExpression(transformExpression(args[0]), workspace), matrix.flat().length);
        const value = toArray(evaluateExpression(transformExpression(rawRight), workspace));

        if (args.length === 1) {
            const flat = matrix.flat();
            const values = flatten(value);
            rows.forEach((index, i) => {
                flat[index - 1] = values[i] ?? values[0];
            });
            workspace[name] = Array.isArray(target[0])
                ? Array.from({ length: matrix.length }, (_, row) => flat.slice(row * matrix[0].length, (row + 1) * matrix[0].length))
                : flat;
            return workspace[name];
        }

        const source = Array.isArray(value)
            ? (Array.isArray(value[0]) ? value : [value])
            : [[value]];
        rows.forEach((row, rowIndex) => {
            cols.forEach((col, colIndex) => {
                matrix[row - 1][col - 1] = source[rowIndex]?.[colIndex] ?? source[0]?.[colIndex] ?? source[rowIndex]?.[0] ?? source[0]?.[0];
            });
        });
        workspace[name] = Array.isArray(target[0]) ? matrix : matrix[0];
        return workspace[name];
    }

    function assignMultiple(names, value) {
        const data = value || {};
        if (!Array.isArray(data) && ("S" in data || "V" in data || Object.prototype.hasOwnProperty.call(data, "values"))) {
            const svdValues = [data.U, data.S, data.V];
            names.forEach((name, i) => { workspace[name] = svdValues[i]; });
            return workspace[names[names.length - 1]];
        }
        if (!Array.isArray(data) && ("L" in data || "U" in data || "P" in data)) {
            const luValues = [data.L, data.U, data.P];
            names.forEach((name, i) => { workspace[name] = luValues[i]; });
            return workspace[names[names.length - 1]];
        }
        if (!Array.isArray(data) && ("Q" in data || "R" in data)) {
            const qrValues = [data.Q, data.R];
            names.forEach((name, i) => { workspace[name] = qrValues[i]; });
            return workspace[names[names.length - 1]];
        }
        throw new Error("Too many output arguments.");
    }

    function hasOwnDataValues(value) {
        return Boolean(
            value
            && typeof value === "object"
            && Object.prototype.hasOwnProperty.call(value, "values")
            && typeof value.values !== "function"
        );
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) return String(value);
        if (outputFormat === "long") return math.format(value, { precision: 15 });
        return math.format(value, { precision: 5 });
    }

    function formatScalar(value) {
        if (typeof value === "function" && value.__matlabLiteDisplay) return value.__matlabLiteDisplay;
        if (typeof value === "number") return formatNumber(value);
        if (value && typeof value === "object" && "re" in value && "im" in value) {
            return `${formatNumber(value.re)} ${value.im < 0 ? "-" : "+"} ${formatNumber(Math.abs(value.im))}i`;
        }
        return String(value);
    }

    function formatValue(name, value) {
        if (value === undefined) return "";
        const label = name || "ans";
        const arr = toArray(value);

        if (Array.isArray(arr)) {
            const rows = Array.isArray(arr[0]) ? arr : [arr];
            const lines = rows.map(row => {
                const cells = row.map(cell => String(formatScalar(cell)).padStart(outputFormat === "long" ? 19 : 11));
                return `    ${cells.join("")}`;
            });
            return `${label} =\n\n${lines.join("\n")}`;
        }

        if (value && typeof value === "object") {
            if (hasOwnDataValues(value)) return formatValue(label, value.values);
            return `${label} =\n\n    ${JSON.stringify(value)}`;
        }

        return `${label} =\n\n    ${formatScalar(value)}`;
    }

    function formatPreview(value) {
        const arr = toArray(value);
        if (Array.isArray(arr)) {
            if (Array.isArray(arr[0])) {
                return arr.map(row => `[${row.map(formatScalar).join(" ")}]`).join("\n");
            }
            return `[${arr.map(formatScalar).join(" ")}]`;
        }
        return formatScalar(value);
    }

    function matrixSize(value) {
        if (typeof value === "function") return "1x1";
        const arr = toArray(value);
        if (Array.isArray(arr)) {
            if (Array.isArray(arr[0])) return `${arr.length}x${arr[0].length}`;
            return `1x${arr.length}`;
        }
        return "1x1";
    }

    function executeMetaCommand(stmt) {
        const lower = stmt.trim().toLowerCase();
        if (lower === "clc") return { type: "control", action: "clc" };
        if (lower === "figure" || /^figure\s*\(\s*\d*\s*\)$/.test(lower)) {
            const requested = lower.match(/^figure\s*\(\s*(\d*)\s*\)$/)?.[1];
            const id = requested ? Number(requested) : figureSerial + 1;
            figureSerial = Math.max(figureSerial, id);
            currentFigureId = id;
            holdState = false;
            currentSubplot = { rows: 1, cols: 1, index: 1 };
            return {
                type: "figure",
                figure: {
                    action: "create",
                    figureId: id,
                    title: `Figure ${id}`,
                    kind: "empty",
                    hold: holdState
                }
            };
        }
        const subplotMatch = lower.match(/^subplot\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (subplotMatch) {
            const rows = Number(subplotMatch[1]);
            const cols = Number(subplotMatch[2]);
            const index = Number(subplotMatch[3]);
            if (rows < 1 || cols < 1 || index < 1 || index > rows * cols) {
                throw new Error("subplot expects subplot(rows, columns, index).");
            }
            ensureCurrentFigure();
            currentSubplot = { rows, cols, index };
            holdState = false;
            return { type: "system", text: `Subplot ${index} selected.` };
        }
        const axisMatch = stmt.trim().match(/^axis\s*\(([\s\S]+)\)$/i);
        if (axisMatch) {
            ensureCurrentFigure();
            const values = flatten(evaluateExpression(transformExpression(axisMatch[1]), workspace)).map(Number);
            if (values.length !== 4 || values.some(value => !Number.isFinite(value))) {
                throw new Error("axis expects axis([xmin xmax ymin ymax]).");
            }
            if (values[0] === values[1] || values[2] === values[3]) {
                throw new Error("Axis limits must have positive width and height.");
            }
            return {
                type: "figure",
                figure: {
                    action: "axis",
                    figureId: currentFigureId,
                    title: `Figure ${currentFigureId}`,
                    kind: "plot",
                    layout: { rows: currentSubplot.rows, cols: currentSubplot.cols },
                    subplot: currentSubplot.index,
                    axis: { x: [values[0], values[1]], y: [values[2], values[3]] }
                }
            };
        }
        const labelMatch = stmt.trim().match(/^(title|xlabel|ylabel)\s*\(([\s\S]+)\)$/i);
        if (labelMatch) {
            ensureCurrentFigure();
            const kind = labelMatch[1].toLowerCase();
            const raw = labelMatch[2].trim();
            if (!isStringLiteral(raw)) throw new Error(`${kind} expects a text label, for example ${kind}('Label').`);
            return {
                type: "figure",
                figure: {
                    action: "label",
                    figureId: currentFigureId,
                    title: `Figure ${currentFigureId}`,
                    kind: "plot",
                    layout: { rows: currentSubplot.rows, cols: currentSubplot.cols },
                    subplot: currentSubplot.index,
                    label: { [kind]: stripStringLiteral(raw) }
                }
            };
        }
        if (lower === "hold on") {
            holdState = true;
            return { type: "system", text: "Hold is on." };
        }
        if (lower === "hold off") {
            holdState = false;
            return { type: "system", text: "Hold is off." };
        }
        if (lower === "hold") {
            holdState = !holdState;
            return { type: "system", text: `Hold is ${holdState ? "on" : "off"}.` };
        }
        if (lower === "clear all") {
            workspace = {};
            currentFigureId = null;
            holdState = false;
            currentSubplot = { rows: 1, cols: 1, index: 1 };
            return { type: "control", action: "reset" };
        }
        if (lower === "clear" || lower === "clearvars") {
            workspace = {};
            return { type: "control", action: "workspace" };
        }
        if (lower.startsWith("clear ") || lower.startsWith("clearvars ")) {
            const names = stmt.trim().replace(/^clearvars\s+|^clear\s+/i, "").split(/\s+/).filter(Boolean);
            names.forEach(name => delete workspace[name]);
            return { type: "control", action: "workspace" };
        }
        if (lower === "who") {
            const names = Object.keys(workspace).sort();
            return { type: "result", text: names.length ? names.join("    ") : "Your variables are:" };
        }
        if (lower === "whos") {
            return { type: "result", text: formatWhos() };
        }
        if (lower === "format short") {
            outputFormat = "short";
            return { type: "system", text: "Numeric display format set to short." };
        }
        if (lower === "format long") {
            outputFormat = "long";
            return { type: "system", text: "Numeric display format set to long." };
        }
        if (lower.startsWith("help")) {
            const topic = lower.split(/\s+/)[1];
            if (!topic) return { type: "result", text: "help displays help for MATLAB-Lite commands. Try help lu, help qr, or help clear." };
            return { type: "result", text: helpTopics[topic] || `No MATLAB-Lite help found for '${topic}'.` };
        }
        return null;
    }

    function executeFigureCommand(stmt) {
        const match = stmt.trim().match(/^(plot|surf|surface)\s*\(([\s\S]*)\)$/i);
        if (!match) return null;

        const kind = match[1].toLowerCase();
        const args = splitTopLevelArgs(match[2]).filter(Boolean).map(evaluateFigureArg);

        if (kind === "plot") return makePlotFigure(args);
        return makeSurfaceFigure(args);
    }

    function evaluateFigureArg(arg) {
        if (isStringLiteral(arg)) return stripStringLiteral(arg);
        return toArray(evaluateExpression(transformExpression(arg), workspace));
    }

    function isStringLiteral(value) {
        const trimmed = value.trim();
        return (trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith("\"") && trimmed.endsWith("\""));
    }

    function stripStringLiteral(value) {
        return value.trim().slice(1, -1);
    }

    function splitTopLevelArgs(input) {
        const args = [];
        let current = "";
        let depth = 0;
        let quote = null;

        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (quote) {
                current += ch;
                if (ch === quote) quote = null;
                continue;
            }
            if ((ch === "'" && !isTransposeQuote(input, i)) || ch === "\"") {
                quote = ch;
                current += ch;
                continue;
            }
            if (ch === "[" || ch === "(" || ch === "{") depth++;
            if (ch === "]" || ch === ")" || ch === "}") depth--;
            if (ch === "," && depth === 0) {
                args.push(current.trim());
                current = "";
                continue;
            }
            current += ch;
        }

        if (current.trim()) args.push(current.trim());
        return args;
    }

    function makePlotFigure(args) {
        if (args.length < 1) throw new Error("plot expects plot(y), plot(x,y), or plot(x,y,style).");
        const series = [];
        let i = 0;

        while (i < args.length) {
            const first = args[i];
            const second = args[i + 1];
            let x;
            let y;
            let style = {};

            if (typeof first === "string") throw new Error("Plot style must follow data.");

            if (Array.isArray(second)) {
                x = flatten(first).map(Number);
                y = flatten(second).map(Number);
                i += 2;
            } else {
                y = flatten(first).map(Number);
                x = y.map((_, index) => index + 1);
                i += 1;
            }

            if (typeof args[i] === "string") {
                style = parsePlotStyle(args[i]);
                i += 1;
            }

            if (x.length !== y.length) throw new Error("Vectors must be the same length.");
            series.push({ x, y, style });
        }

        if (!series.length) throw new Error("plot expects numeric data.");
        const figureId = ensureCurrentFigure();

        return {
            type: "figure",
            figure: {
                action: "plot",
                figureId,
                kind: "plot",
                title: `Figure ${figureId}`,
                append: holdState,
                hold: holdState,
                layout: { rows: currentSubplot.rows, cols: currentSubplot.cols },
                subplot: currentSubplot.index,
                series: series.map(item => ({ ...item, subplot: currentSubplot.index }))
            }
        };
    }

    function parsePlotStyle(style) {
        const colorMap = {
            b: "#2563eb",
            g: "#16a34a",
            r: "#dc2626",
            c: "#0891b2",
            m: "#c026d3",
            y: "#ca8a04",
            k: "#111827",
            w: "#f8fafc"
        };
        const markerMatch = style.match(/[+*.xosd^v<>]/);
        const colorMatch = style.match(/[bgrcmykw]/);
        let lineDash = [];
        if (style.includes("--")) lineDash = [8, 5];
        else if (style.includes(":")) lineDash = [2, 4];
        else if (style.includes("-.")) lineDash = [8, 4, 2, 4];
        return {
            color: colorMatch ? colorMap[colorMatch[0]] : "#2563eb",
            lineDash,
            marker: markerMatch ? markerMatch[0] : ""
        };
    }

    function makeSurfaceFigure(args) {
        if (args.length !== 1 && args.length !== 3) throw new Error("surf expects surf(Z) or surf(X,Y,Z).");
        const z = matrixForSurface(args.length === 1 ? args[0] : args[2]);
        const rows = z.length;
        const cols = z[0]?.length || 0;

        if (rows < 2 || cols < 2) throw new Error("Surface data must be a matrix with at least two rows and columns.");

        const x = args.length === 3 ? matrixForSurface(args[0]) : gridMatrix(rows, cols, "x");
        const y = args.length === 3 ? matrixForSurface(args[1]) : gridMatrix(rows, cols, "y");
        const figureId = ensureCurrentFigure();

        return {
            type: "figure",
            figure: {
                action: "surface",
                figureId,
                kind: "surf",
                title: `Figure ${figureId}`,
                append: false,
                hold: holdState,
                x,
                y,
                z
            }
        };
    }

    function matrixForSurface(value) {
        const arr = toArray(value);
        if (!Array.isArray(arr)) throw new Error("Surface data must be a matrix.");
        if (Array.isArray(arr[0])) return arr.map(row => row.map(Number));
        return [arr.map(Number)];
    }

    function gridMatrix(rows, cols, axis) {
        return Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => axis === "x" ? col + 1 : row + 1)
        );
    }

    function ensureCurrentFigure() {
        if (currentFigureId === null) {
            figureSerial += 1;
            currentFigureId = figureSerial;
        }
        return currentFigureId;
    }

    function executeStatement(stmt) {
        const meta = executeMetaCommand(stmt);
        if (meta) return meta;

        const figure = executeFigureCommand(stmt);
        if (figure) return figure;

        if (isIndexedAssignment(stmt)) {
            const assignedResult = executeIndexedAssignment(stmt);
            const name = stmt.match(/^\s*([A-Za-z]\w*)/)?.[1] || "ans";
            return { type: "result", name, value: assignedResult };
        }

        if (isAssignment(stmt)) {
            const assignment = parseAssignment(stmt);
            if (assignment.names.length === 1 && isAnonymousFunctionExpression(assignment.right)) {
                const assignedResult = createAnonymousFunction(assignment.right);
                workspace[assignment.names[0]] = assignedResult;
                return { type: "result", name: assignment.names[0], value: assignedResult };
            }
            const rhs = transformExpression(assignment.right);
            const result = evaluateExpression(rhs, workspace);

            if (assignment.names.length > 1) {
                const assignedResult = assignMultiple(assignment.names, result);
                return { type: "result", name: assignment.names[assignment.names.length - 1], value: assignedResult };
            }

            const assignedResult = hasOwnDataValues(result) ? result.values : result;
            workspace[assignment.names[0]] = assignedResult;
            return { type: "result", name: assignment.names[0], value: assignedResult };
        }

        const expr = transformExpression(stmt);
        const result = evaluateExpression(expr, workspace);
        workspace.ans = result;
        return { type: "result", name: "ans", value: result };
    }

    function execute(input) {
        const cleaned = preprocess(input);
        if (!cleaned) return [];

        const statements = splitStatements(cleaned);
        const results = [];

        for (let index = 0; index < statements.length; index++) {
            const { text, suppress } = statements[index];
            if (!text) continue;
            try {
                if (/^for\s+/i.test(text)) {
                    const loopEnd = findLoopEnd(statements, index);
                    const body = statements.slice(index + 1, loopEnd);
                    executeForLoop(text, body, results);
                    index = loopEnd;
                } else if (/^end$/i.test(text)) {
                    continue;
                } else {
                    pushExecutionResponse(executeStatement(text), suppress, results);
                }
            } catch (err) {
                results.push({
                    type: "error",
                    text: matlabError(err)
                });
                break;
            }
        }

        return results;
    }

    function pushExecutionResponse(response, suppress, results) {
        if (response.type === "control") {
            results.push(response);
        } else if (response.type === "system" && !suppress) {
            results.push(response);
        } else if (response.type === "figure") {
            results.push(response);
        } else if (!suppress) {
            results.push({
                type: "result",
                text: response.text || formatValue(response.name, response.value)
            });
        }
    }

    function findLoopEnd(statements, startIndex) {
        let depth = 0;
        for (let i = startIndex; i < statements.length; i++) {
            if (/^for\s+/i.test(statements[i].text)) depth++;
            if (/^end$/i.test(statements[i].text)) {
                depth--;
                if (depth === 0) return i;
            }
        }
        throw new Error("FOR loop must end with end.");
    }

    function executeForLoop(header, body, results) {
        const match = header.match(/^for\s+([A-Za-z]\w*)\s*=\s*([\s\S]+)$/i);
        if (!match) throw new Error("Invalid FOR loop syntax.");
        const [, variable, rangeExpr] = match;
        const values = flatten(evaluateExpression(transformExpression(rangeExpr), workspace));

        values.forEach(value => {
            workspace[variable] = value;
            body.forEach(({ text, suppress }) => {
                if (!text || /^end$/i.test(text)) return;
                pushExecutionResponse(executeStatement(text), suppress, results);
            });
        });
    }

    function matlabError(err) {
        const message = err && err.message ? err.message : String(err);
        if (/^Undefined function or variable/i.test(message)) return message;
        if (/Undefined symbol/i.test(message)) return `Undefined function or variable. ${message}`;
        if (/not implemented in MATLAB-Lite/i.test(message)) return message;
        return `Error using MATLAB-Lite\n${message}`;
    }

    function workspaceInfo() {
        return Object.keys(workspace)
            .sort()
            .map(name => ({
                name,
                size: matrixSize(workspace[name]),
                className: typeof workspace[name] === "function" ? "function_handle" : "double",
                preview: formatPreview(workspace[name])
            }));
    }

    function bytesFor(value) {
        if (typeof value === "function") return 0;
        const arr = toArray(value);
        if (Array.isArray(arr)) return arr.flat(Infinity).length * 8;
        return 8;
    }

    function formatWhos() {
        const names = Object.keys(workspace).sort();
        if (!names.length) return "No variables in the workspace.";

        const rows = names.map(name => ({
            name,
            size: matrixSize(workspace[name]),
            bytes: bytesFor(workspace[name]),
            className: typeof workspace[name] === "function" ? "function_handle" : "double"
        }));

        const header = "  Name        Size            Bytes  Class     Attributes";
        const body = rows.map(row => {
            return `  ${row.name.padEnd(10)}  ${row.size.padEnd(12)}  ${String(row.bytes).padStart(7)}  ${row.className.padEnd(8)}`;
        });
        return `${header}\n\n${body.join("\n")}`;
    }

    return {
        execute,
        getWorkspace: workspaceInfo,
        reset: () => {
            workspace = {};
            outputFormat = "short";
            currentFigureId = null;
            holdState = false;
            currentSubplot = { rows: 1, cols: 1, index: 1 };
        },
        clearWorkspace: () => {
            workspace = {};
        },
        formatValue
    };
})();
