document.addEventListener("DOMContentLoaded", () => {
    const appShell = document.getElementById("app-shell");
    const workspaceShell = document.querySelector(".workspace");
    const sidebar = document.getElementById("sidebar");
    const chapterList = document.getElementById("chapter-list");
    const chapterSearch = document.getElementById("chapter-search");
    const theoryPane = document.getElementById("theory-pane");
    const labPane = document.getElementById("lab-pane");
    const resizer = document.getElementById("resizer");
    const restoreSidebar = document.getElementById("restore-sidebar");
    const restoreTheory = document.getElementById("restore-theory");
    const restoreLab = document.getElementById("restore-lab");
    const hideTheory = document.getElementById("hide-theory");
    const hideLab = document.getElementById("hide-lab");
    const collapseSidebar = document.getElementById("collapse-sidebar");
    const theoryScroll = document.getElementById("theory-scroll");
    const breadcrumb = document.getElementById("breadcrumb");
    const topicKicker = document.getElementById("topic-kicker");
    const chapterTitle = document.getElementById("chapter-title");
    const theoryContent = document.getElementById("theory-content");
    const consoleOutput = document.getElementById("console-output");
    const cmdInput = document.getElementById("cmd-input");
    const runCommandBtn = document.getElementById("run-command");
    const editorRunBtn = document.getElementById("editor-run");
    const clearConsoleBtn = document.getElementById("clear-console");
    const clearWorkspaceBtn = document.getElementById("clear-workspace");
    const resetMatlabBtn = document.getElementById("reset-matlab");
    const variablesPanel = document.getElementById("variables-panel");
    const variablesTable = document.getElementById("variables-table");
    const toggleVariables = document.getElementById("toggle-variables");
    const closeVariables = document.getElementById("close-variables");
    const mobileTabs = document.getElementById("mobile-tabs");

    let currentChapter = CourseContent.dashboard;
    let currentSubtopic = "start";
    let expandedChapters = new Set(["functions"]);
    let expandedSections = new Set();
    let commandHistory = [];
    let historyIndex = -1;
    let scrollObserver = null;
    const backButton = document.getElementById('course-back');
    const figureDialog = document.getElementById('figure-dialog');
    const figureFrame = document.getElementById('figure-frame');
    const figureTitle = document.getElementById('figure-title');
    let activeFigureId = null;
    let mobileView = 'theory';
    const figureData = new Map();

    function init() {
        renderNavigation();
        bindEvents();
        setupResizer();
        const parts = location.hash.slice(1).split('/');
        const chapter = findChapter(parts[0]) || CourseContent.dashboard;
        const section = findSection(chapter, parts[1]);
        const initial = history.state?.lag2 ? {...history.state, figureId: null} : {lag2: true, index: 0, chapterId: chapter.id, sectionId: section.id, view: 'theory', figureId: null, scrollTop: 0};
        history.replaceState(initial, '', routeUrl(initial));
        loadChapter(initial.chapterId, initial.sectionId, false);
        updateMobileView(initial.view, false);
        syncPaneState();
        syncResponsiveControls();
        syncBackButton();
    }

    function routeUrl(route) {
        return '#' + route.chapterId + '/' + route.sectionId;
    }

    function syncBackButton() {
        backButton.disabled = !(history.state?.lag2 && history.state.index > 0);
    }

    function pushRoute(changes) {
        const previous = history.state;
        if (!previous?.lag2) return;
        const next = {...previous, ...changes};
        const same = ['chapterId', 'sectionId', 'view', 'figureId'].every(key => previous[key] === next[key]);
        if (same) return;
        history.replaceState({...previous, scrollTop: theoryScroll.scrollTop}, '', routeUrl(previous));
        if (previous.view === 'nav' && changes.chapterId && changes.view === 'theory') {
            next.scrollTop = changes.scrollTop ?? 0;
            history.replaceState(next, '', routeUrl(next));
            syncBackButton();
            return;
        }
        next.index = previous.index + 1;
        next.scrollTop = changes.scrollTop ?? 0;
        history.pushState(next, '', routeUrl(next));
        syncBackButton();
    }

    function restoreRoute(route) {
        if (!route?.lag2) return;
        const chapter = findChapter(route.chapterId) || CourseContent.dashboard;
        if (currentChapter.id !== chapter.id) loadChapter(chapter.id, route.sectionId, false);
        else scrollToSection(route.sectionId, false, false);
        updateMobileView(route.view || 'theory', false);
        requestAnimationFrame(() => theoryScroll.scrollTo({top: route.scrollTop || 0, behavior: 'auto'}));
        if (route.figureId && figureData.has(route.figureId)) showFigure(route.figureId, false);
        else hideFigure();
        syncBackButton();
    }

    function allChapters() {
        return [CourseContent.dashboard, ...CourseContent.chapters];
    }

    function findChapter(id) {
        if (id === "dashboard") return CourseContent.dashboard;
        return CourseContent.chapters.find(chapter => chapter.id === id);
    }

    function findSection(chapter, sectionId) {
        return chapter.sections.find(section => section.id === sectionId) || chapter.sections[0];
    }

    function findParentSection(chapter, section) {
        if (!section?.parent) return null;
        return chapter.sections.find(item => item.id === section.parent) || null;
    }

    function renderNavigation(filter = "") {
        const query = filter.trim().toLowerCase();
        chapterList.innerHTML = "";

        const dashboardButton = document.createElement("button");
        dashboardButton.className = `chapter-button ${currentChapter.id === "dashboard" ? "active" : ""}`;
        dashboardButton.innerHTML = `<i class="fas fa-house"></i><span>Welcome</span>`;
        dashboardButton.addEventListener("click", () => {
            loadChapter("dashboard");
            closeMobileNavigation();
        });
        chapterList.appendChild(dashboardButton);

        CourseContent.chapters.forEach(chapter => {
            const matchingSections = chapter.sections.filter(section => {
                const haystack = `${chapter.title} ${section.title} ${section.navTitle}`.toLowerCase();
                return !query || haystack.includes(query);
            });

            if (query && !matchingSections.length) return;

            const group = document.createElement("div");
            group.className = `chapter-group ${expandedChapters.has(chapter.id) || query ? "expanded" : ""}`;

            const chapterButton = document.createElement("button");
            chapterButton.className = `chapter-button ${currentChapter.id === chapter.id ? "active" : ""}`;
            chapterButton.innerHTML = `
                <span>${chapter.kicker.replace("Chapter ", "")}. ${chapter.shortTitle}</span>
                <i class="fas fa-chevron-right chapter-toggle" title="Expand or collapse topics"></i>
            `;
            chapterButton.addEventListener("click", () => {
                if (currentChapter.id !== chapter.id) {
                    expandedChapters.add(chapter.id);
                    loadChapter(chapter.id);
                    closeMobileNavigation();
                    return;
                }
                expandedChapters.add(chapter.id);
                scrollToSection(chapter.sections[0]?.id || "start");
                updateBreadcrumb();
                renderNavigation(chapterSearch.value);
                closeMobileNavigation();
            });
            chapterButton.querySelector(".chapter-toggle").addEventListener("click", event => {
                event.stopPropagation();
                if (expandedChapters.has(chapter.id)) expandedChapters.delete(chapter.id);
                else expandedChapters.add(chapter.id);
                renderNavigation(chapterSearch.value);
            });

            const matchingIds = new Set(matchingSections.map(section => section.id));
            const roots = chapter.sections.filter(section => !section.parent);
            const childMap = chapter.sections.reduce((map, section) => {
                if (!section.parent) return map;
                if (!map.has(section.parent)) map.set(section.parent, []);
                map.get(section.parent).push(section);
                return map;
            }, new Map());

            const subtopicList = document.createElement("div");
            subtopicList.className = "subtopic-list";

            const currentSection = currentChapter.id === chapter.id ? findSection(chapter, currentSubtopic) : null;
            const currentParent = findParentSection(chapter, currentSection);

            const addSectionButton = (section, container, extraClass = "", children = []) => {
                const hasChildren = children.length > 0;
                const childrenExpanded = query || expandedSections.has(section.id) || currentParent?.id === section.id;
                const subButton = document.createElement("button");
                subButton.className = [
                    "subtopic-button",
                    section.deepDive ? "deep-dive" : "",
                    hasChildren ? "has-children" : "",
                    childrenExpanded ? "expanded" : "",
                    extraClass,
                    currentChapter.id === chapter.id && (currentSubtopic === section.id || currentParent?.id === section.id) ? "active" : ""
                ].filter(Boolean).join(" ");
                subButton.innerHTML = `<span>${escapeHtml(section.title)}</span>${hasChildren ? '<i class="fas fa-chevron-right section-toggle"></i>' : ""}`;
                subButton.addEventListener("click", event => {
                    event.stopPropagation();
                    expandedChapters.add(chapter.id);
                    if (currentChapter.id !== chapter.id) loadChapter(chapter.id, section.id);
                    else scrollToSection(section.id);
                    closeMobileNavigation();
                });
                subButton.querySelector(".section-toggle")?.addEventListener("click", event => {
                    event.stopPropagation();
                    expandedChapters.add(chapter.id);
                    if (expandedSections.has(section.id)) expandedSections.delete(section.id);
                    else expandedSections.add(section.id);
                    renderNavigation(chapterSearch.value);
                });
                container.appendChild(subButton);
                return childrenExpanded;
            };

            roots.forEach(section => {
                const children = childMap.get(section.id) || [];
                const rootMatches = !query || matchingIds.has(section.id) || children.some(child => matchingIds.has(child.id));
                if (!rootMatches) return;
                const showChildren = addSectionButton(section, subtopicList, "", children);
                const visibleChildren = query ? children.filter(child => matchingIds.has(child.id)) : children;
                if (visibleChildren.length && showChildren) {
                    const deepDiveList = document.createElement("div");
                    deepDiveList.className = "deep-dive-list";
                    visibleChildren.forEach(child => addSectionButton(child, deepDiveList, "nested"));
                    subtopicList.appendChild(deepDiveList);
                }
            });

            group.appendChild(chapterButton);
            group.appendChild(subtopicList);
            chapterList.appendChild(group);
        });
    }

    function loadChapter(id, sectionId = null, addHistory = true) {
        const chapter = findChapter(id);
        if (!chapter) return;

        const targetSection = findSection(chapter, sectionId).id;
        if (addHistory) pushRoute({chapterId: id, sectionId: targetSection, view: 'theory', figureId: null});
        currentChapter = chapter;
        currentSubtopic = targetSection;
        topicKicker.textContent = chapter.kicker || "Interactive course";
        chapterTitle.textContent = chapter.title;
        theoryContent.innerHTML = chapter.html;
        appendChapterPager();

        renderNavigation(chapterSearch.value);
        setupTheoryActions();
        setupScrollSpy();
        updateBreadcrumb();

        requestAnimationFrame(() => {
            if (sectionId) scrollToSection(currentSubtopic, false, false);
            else theoryScroll.scrollTo({ top: 0, behavior: "auto" });
            typesetMath();
        });
    }

    function appendChapterPager() {
        const sequence = CourseContent.chapters;
        const currentIndex = sequence.findIndex(chapter => chapter.id === currentChapter.id);
        if (currentIndex < 0) return;
        const previous = sequence[currentIndex - 1];
        const next = sequence[currentIndex + 1];
        if (!previous && !next) return;

        const pager = document.createElement("nav");
        pager.className = "chapter-pager";
        pager.setAttribute("aria-label", "Chapter navigation");
        pager.innerHTML = `
            ${previous ? `
                <button type="button" class="chapter-pager-btn previous" data-chapter-nav="${escapeHtml(previous.id)}">
                    <i class="fas fa-arrow-left"></i>
                    <span>
                        <small>Previous chapter</small>
                        ${escapeHtml(previous.shortTitle || previous.title)}
                    </span>
                </button>
            ` : `<span></span>`}
            ${next ? `
                <button type="button" class="chapter-pager-btn next" data-chapter-nav="${escapeHtml(next.id)}">
                    <span>
                        <small>Next chapter</small>
                        ${escapeHtml(next.shortTitle || next.title)}
                    </span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            ` : `<span></span>`}
        `;
        theoryContent.appendChild(pager);
    }

    function setupTheoryActions() {
        theoryContent.querySelectorAll(".load-matlab").forEach(button => {
            button.addEventListener("click", () => {
                const codeId = button.dataset.codeId;
                const code = currentChapter.matlabBlocks?.[codeId];
                if (!code) return;
                revealLab();
                cmdInput.value = code;
                autoSizeEditor();
                cmdInput.focus();
                updateMobileView("lab");
            });
        });

        theoryContent.querySelectorAll("[data-chapter-nav]").forEach(button => {
            button.addEventListener("click", () => {
                loadChapter(button.dataset.chapterNav);
                updateMobileView("theory");
            });
        });

        theoryContent.querySelectorAll(".deep-dive-toggle").forEach(button => {
            button.addEventListener("click", () => {
                const target = document.getElementById(button.dataset.target);
                if (!target) return;
                target.hidden = !target.hidden;
                if (!target.hidden) scrollToSection(target.id);
            });
        });

        setupDeepDiveCards();
        setupSubstitutionVisualizers();
        setupProcessVisualizers();
        setupLuFactorizerVisualizers();
        setupCholeskyFactorizerVisualizers();
    }

    function setupDeepDiveCards() {
        theoryContent.querySelectorAll("section.deep-dive").forEach(section => {
            if (section.dataset.collapsibleReady) return;
            section.dataset.collapsibleReady = "true";
            const heading = section.querySelector("h2");
            if (!heading) return;

            const body = document.createElement("div");
            body.className = "deep-dive-body";
            [...section.children].forEach(child => {
                if (child !== heading) body.appendChild(child);
            });

            const button = document.createElement("button");
            button.type = "button";
            button.className = "deep-dive-header";
            button.innerHTML = `<span>${escapeHtml(heading.textContent)}</span><i class="fas fa-chevron-down"></i>`;
            heading.replaceWith(button);
            section.appendChild(body);
            section.classList.add("collapsed");

            button.addEventListener("click", () => {
                section.classList.toggle("collapsed");
                typesetMath();
            });
        });
        expandDeepDive(currentSubtopic);
    }

    function expandDeepDive(sectionId) {
        const section = document.getElementById(sectionId);
        if (section?.classList.contains("deep-dive")) {
            section.classList.remove("collapsed");
            typesetMath();
        }
    }

    function setupSubstitutionVisualizers() {
        theoryContent.querySelectorAll(".substitution-visualizer").forEach(card => {
            const state = { steps: [], index: 0, matrix: [], vector: [] };
            initializeSubstitutionFrame(card);
            renderSubstitutionEditor(card, parseMatrixData(card.dataset.matrix), parseVectorData(card.dataset.vector));
            const run = () => {
                const output = card.querySelector("[data-role='output']");
                try {
                    const matrix = readMatrixGrid(card);
                    const vector = readVectorGrid(card);
                    state.steps = buildSubstitutionSteps(matrix, vector, card.dataset.mode);
                    state.matrix = matrix;
                    state.vector = vector;
                    state.index = 0;
                    renderSubstitutionStep(card, state);
                } catch (error) {
                    output.innerHTML = `<div class="visualizer-error">${escapeHtml(error.message)}</div>`;
                }
            };

            card.querySelector("[data-action='run']").addEventListener("click", run);
            card.querySelectorAll("input[type='number']").forEach(input => {
                input.addEventListener("input", run);
                input.addEventListener("focus", () => input.select());
            });
            card.querySelector("[data-action='prev']").addEventListener("click", () => {
                state.index = Math.max(0, state.index - 1);
                renderSubstitutionStep(card, state);
            });
            card.querySelector("[data-action='next']").addEventListener("click", () => {
                state.index = Math.min(state.steps.length - 1, state.index + 1);
                renderSubstitutionStep(card, state);
            });
            run();
        });
    }

    function setupProcessVisualizers() {
        theoryContent.querySelectorAll(".process-visualizer").forEach(card => {
            const config = getProcessConfig(card.dataset.process);
            if (!config) return;
            const state = { index: 0, steps: config.steps };
            card.innerHTML = `
                <h3>${escapeHtml(config.title)}</h3>
                <p>${escapeHtml(config.intro)}</p>
                <div class="process-stage" data-role="stage"></div>
                <div class="visualizer-actions process-actions">
                    <button type="button" data-action="prev">Previous</button>
                    <span class="process-progress" data-role="progress"></span>
                    <button type="button" data-action="next">Next</button>
                </div>
                <div class="process-output" data-role="output"></div>
            `;

            const render = () => renderProcessStep(card, state);
            card.querySelector("[data-action='prev']").addEventListener("click", () => {
                state.index = Math.max(0, state.index - 1);
                render();
            });
            card.querySelector("[data-action='next']").addEventListener("click", () => {
                state.index = Math.min(state.steps.length - 1, state.index + 1);
                render();
            });
            render();
        });
    }

    function setupLuFactorizerVisualizers() {
        theoryContent.querySelectorAll("[data-visualizer='lu-factorizer']").forEach(card => {
            if (card.dataset.ready) return;
            card.dataset.ready = "true";

            const state = { steps: [], index: 0 };
            const input = card.querySelector("[data-lu-input]");
            const factorButton = card.querySelector("[data-lu-factor]");
            const prevButton = card.querySelector("[data-lu-prev]");
            const nextButton = card.querySelector("[data-lu-next]");
            const resetButton = card.querySelector("[data-lu-reset]");

            const factorize = () => {
                try {
                    state.steps = buildLuSteps(parseLuInput(input.value));
                    state.index = 0;
                    renderLuFactorizer(card, state);
                } catch (error) {
                    card.querySelector("[data-lu-status]").innerHTML = `<p class="visualizer-error">${escapeHtml(error.message)}</p>`;
                    ["[data-lu-p]", "[data-lu-l]", "[data-lu-u]"].forEach(selector => {
                        const target = card.querySelector(selector);
                        if (target) target.innerHTML = "";
                    });
                }
            };

            factorButton.addEventListener("click", factorize);
            prevButton.addEventListener("click", () => {
                state.index = Math.max(0, state.index - 1);
                renderLuFactorizer(card, state);
            });
            nextButton.addEventListener("click", () => {
                state.index = Math.min(state.steps.length - 1, state.index + 1);
                renderLuFactorizer(card, state);
            });
            resetButton.addEventListener("click", () => {
                input.value = "4 3 2\n6 3 1\n2 1 3";
                factorize();
            });

            factorize();
        });
    }

    function setupCholeskyFactorizerVisualizers() {
        theoryContent.querySelectorAll("[data-visualizer='cholesky-factorizer']").forEach(card => {
            if (card.dataset.ready) return;
            card.dataset.ready = "true";

            const state = { steps: [], index: 0 };
            const input = card.querySelector("[data-chol-input]");
            const factorButton = card.querySelector("[data-chol-factor]");
            const prevButton = card.querySelector("[data-chol-prev]");
            const nextButton = card.querySelector("[data-chol-next]");
            const resetButton = card.querySelector("[data-chol-reset]");

            const factorize = () => {
                try {
                    state.steps = buildCholeskySteps(parseLuInput(input.value));
                    state.index = 0;
                    renderCholeskyFactorizer(card, state);
                } catch (error) {
                    card.querySelector("[data-chol-status]").innerHTML = `<p class="visualizer-error">${escapeHtml(error.message)}</p>`;
                    ["[data-chol-a]", "[data-chol-l]", "[data-chol-r]"].forEach(selector => {
                        const target = card.querySelector(selector);
                        if (target) target.innerHTML = "";
                    });
                }
            };

            factorButton.addEventListener("click", factorize);
            prevButton.addEventListener("click", () => {
                state.index = Math.max(0, state.index - 1);
                renderCholeskyFactorizer(card, state);
            });
            nextButton.addEventListener("click", () => {
                state.index = Math.min(state.steps.length - 1, state.index + 1);
                renderCholeskyFactorizer(card, state);
            });
            resetButton.addEventListener("click", () => {
                input.value = "4 2\n2 3";
                factorize();
            });

            factorize();
        });
    }

    function parseLuInput(text) {
        const rows = text.trim().split(/\n|;/).map(row => row.trim()).filter(Boolean);
        const matrix = rows.map(row => row.split(/[\s,]+/).filter(Boolean).map(Number));
        if (!matrix.length) throw new Error("Enter a square matrix first.");
        const n = matrix.length;
        if (matrix.some(row => row.length !== n || row.some(value => !Number.isFinite(value)))) {
            throw new Error("This visualizer needs a square numeric matrix.");
        }
        return matrix;
    }

    function buildLuSteps(matrix) {
        const n = matrix.length;
        const U = matrix.map(row => row.slice());
        const L = identityMatrix(n);
        const P = identityMatrix(n);
        const steps = [];
        const pushStep = (title, text, marks = {}) => {
            steps.push({
                title,
                text,
                P: cloneMatrix(P),
                L: cloneMatrix(L),
                U: cloneMatrix(U),
                marks
            });
        };
        pushStep(
            "Setup: start PA=LU",
            "Start with U = A, P = I, and L = I. U is the working copy of A that will become upper triangular. L will store elimination multipliers. P will account for row swaps by swapping the same rows in P whenever rows are swapped in U. Press Next to choose the first pivot.",
            {
                P: Object.fromEntries(Array.from({ length: n }, (_, index) => [`${index},${index}`, "new"])),
                L: Object.fromEntries(Array.from({ length: n }, (_, index) => [`${index},${index}`, "new"]))
            }
        );

        for (let k = 0; k < n; k++) {
            let pivot = k;
            let max = Math.abs(U[k][k]);
            for (let row = k + 1; row < n; row++) {
                const value = Math.abs(U[row][k]);
                if (value > max) {
                    max = value;
                    pivot = row;
                }
            }

            if (max < 1e-12) throw new Error("Matrix is singular to working precision; a zero pivot was reached.");

            if (pivot !== k) {
                const lSwapText = k > 0 ? " The already-stored multipliers in L for earlier columns swap with those rows too." : "";
                pushStep(
                    `Pivot step ${k + 1}: swap rows`,
                    `Look down column ${k + 1} from row ${k + 1} and choose the largest absolute value, so negative entries count by size too. The best pivot is in row ${pivot + 1}. Press Next to swap rows ${k + 1} and ${pivot + 1} in U; the same swap is accounted for by swapping rows ${k + 1} and ${pivot + 1} in P.${lSwapText}`,
                    {
                        U: { [`${pivot},${k}`]: "pivot", [`${k},${k}`]: "target" },
                        P: { [`${k},${k}`]: "target", [`${pivot},${pivot}`]: "target" }
                    }
                );
                swapRows(U, k, pivot);
                swapRows(P, k, pivot);
                for (let col = 0; col < k; col++) {
                    const temp = L[k][col];
                    L[k][col] = L[pivot][col];
                    L[pivot][col] = temp;
                }
            } else {
                pushStep(
                    `Pivot step ${k + 1}: keep row ${k + 1}`,
                    `Look down column ${k + 1} from row ${k + 1} and choose the largest absolute value. It is already in row ${k + 1}, so P does not change. Press Next to use this pivot and begin clearing entries below it in U.`,
                    { U: { [`${k},${k}`]: "pivot" } }
                );
            }

            for (let row = k + 1; row < n; row++) {
                const multiplier = U[row][k] / U[k][k];
                pushStep(
                    `Eliminate entry (${row + 1}, ${k + 1})`,
                    `Entry (${row + 1}, ${k + 1}) means row ${row + 1}, column ${k + 1}, below the pivot. Store m_${row + 1}${k + 1} = ${formatNumber(multiplier)} in L at row ${row + 1}, column ${k + 1}. Press Next to update U with R${row + 1} <- R${row + 1} - m_${row + 1}${k + 1} R${k + 1}; this makes entry (${row + 1}, ${k + 1}) become 0 in U.`,
                    {
                        U: { [`${k},${k}`]: "pivot", [`${row},${k}`]: "target" },
                        L: { [`${row},${k}`]: "target" }
                    }
                );
                L[row][k] = multiplier;
                for (let col = k; col < n; col++) {
                    U[row][col] -= multiplier * U[k][col];
                    if (Math.abs(U[row][col]) < 1e-12) U[row][col] = 0;
                }
            }
        }

        steps.push({
            title: "Finished: PA=LU",
            text: "U is upper triangular, L contains the multipliers, and P contains the row swaps. The equality to check is P*A = L*U.",
            P: cloneMatrix(P),
            L: cloneMatrix(L),
            U: cloneMatrix(U),
            marks: {}
        });
        return steps;
    }

    function renderLuFactorizer(card, state) {
        if (!state.steps.length) return;
        const step = state.steps[state.index];
        card.querySelector("[data-lu-status]").innerHTML = `
            <h4>${escapeHtml(step.title)}</h4>
            <p>${highlightLuStepText(step.text)}</p>
            <div class="process-progress">${state.index + 1} / ${state.steps.length}</div>
        `;
        renderLuMatrix(card.querySelector("[data-lu-p]"), "P", step.P, step.marks.P);
        renderLuMatrix(card.querySelector("[data-lu-l]"), "L", step.L, step.marks.L);
        renderLuMatrix(card.querySelector("[data-lu-u]"), "U", step.U, step.marks.U);
        card.querySelector("[data-lu-prev]").disabled = state.index === 0;
        card.querySelector("[data-lu-next]").disabled = state.index === state.steps.length - 1;
    }

    function highlightLuStepText(text) {
        return escapeHtml(text).replace(
            /(column \d+|rows? \d+(?: and \d+)?|entry \(\d+, \d+\)|R\d+|m_\d+)/g,
            `<span class="lu-term">$1</span>`
        );
    }

    function renderLuMatrix(target, name, data, marks = {}) {
        const columnCount = data[0]?.length || 1;
        target.innerHTML = `
            <div class="process-matrix" aria-label="${escapeHtml(name)}" style="grid-template-columns: repeat(${columnCount}, minmax(44px, 1fr));">
                ${data.map((row, rowIndex) => row.map((value, colIndex) => {
                    const mark = marks?.[`${rowIndex},${colIndex}`] || "";
                    return `<div class="process-cell ${mark}">${escapeHtml(formatProcessValue(value))}</div>`;
                }).join("")).join("")}
            </div>
        `;
    }

    function buildCholeskySteps(matrix) {
        const n = matrix.length;
        validateSymmetricMatrix(matrix);
        const L = Array.from({ length: n }, () => Array(n).fill(0));
        const steps = [];
        const pushStep = (title, text, marks = {}) => {
            steps.push({
                title,
                text,
                A: cloneMatrix(matrix),
                L: cloneMatrix(L),
                R: transposeArray(L),
                marks
            });
        };

        for (let k = 0; k < n; k++) {
            const diagonalCorrection = Array.from({ length: k }, (_, j) => L[k][j] * L[k][j]).reduce((sum, value) => sum + value, 0);
            const radicand = matrix[k][k] - diagonalCorrection;
            pushStep(
                `Column ${k + 1}: compute diagonal`,
                `The next diagonal entry is l_${k + 1}${k + 1} = sqrt(a_${k + 1}${k + 1} - previous squares). Positive definiteness means this leftover must be positive; here it is ${formatNumber(radicand)}. Press Next to write l_${k + 1}${k + 1}.`,
                { A: { [`${k},${k}`]: "pivot" }, L: { [`${k},${k}`]: "target" } }
            );
            if (radicand <= 1e-12) {
                throw new Error("This matrix is not positive definite; Cholesky reached a non-positive square-root value.");
            }
            L[k][k] = Math.sqrt(radicand);

            for (let i = k + 1; i < n; i++) {
                const correction = Array.from({ length: k }, (_, j) => L[i][j] * L[k][j]).reduce((sum, value) => sum + value, 0);
                const value = (matrix[i][k] - correction) / L[k][k];
                pushStep(
                    `Column ${k + 1}: compute l_${i + 1}${k + 1}`,
                    `Match a_${i + 1}${k + 1}. Symmetry means a_${i + 1}${k + 1} mirrors a_${k + 1}${i + 1}, so one lower-triangular entry controls both positions in A = L L^T. Subtract the previous dot product, then divide by positive l_${k + 1}${k + 1}. Press Next to write l_${i + 1}${k + 1} = ${formatNumber(value)}.`,
                    { A: { [`${i},${k}`]: "target", [`${k},${i}`]: "known" }, L: { [`${k},${k}`]: "pivot", [`${i},${k}`]: "target" } }
                );
                L[i][k] = value;
            }
        }

        steps.push({
            title: "Finished: A = L L^T",
            text: "L is lower triangular with positive diagonal entries. MATLAB's R = chol(A) is the transpose, so A = R^T R.",
            A: cloneMatrix(matrix),
            L: cloneMatrix(L),
            R: transposeArray(L),
            marks: {}
        });
        return steps;
    }

    function validateSymmetricMatrix(matrix) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = row + 1; col < matrix.length; col++) {
                if (Math.abs(matrix[row][col] - matrix[col][row]) > 1e-10) {
                    throw new Error(`Cholesky needs a symmetric matrix: entries (${row + 1},${col + 1}) and (${col + 1},${row + 1}) must match.`);
                }
            }
        }
    }

    function renderCholeskyFactorizer(card, state) {
        if (!state.steps.length) return;
        const step = state.steps[state.index];
        card.querySelector("[data-chol-status]").innerHTML = `
            <h4>${escapeHtml(step.title)}</h4>
            <p>${highlightCholeskyStepText(step.text)}</p>
            <div class="process-progress">${state.index + 1} / ${state.steps.length}</div>
        `;
        renderLuMatrix(card.querySelector("[data-chol-a]"), "A", step.A, step.marks.A);
        renderLuMatrix(card.querySelector("[data-chol-l]"), "L", step.L, step.marks.L);
        renderLuMatrix(card.querySelector("[data-chol-r]"), "R", step.R, step.marks.R);
        card.querySelector("[data-chol-prev]").disabled = state.index === 0;
        card.querySelector("[data-chol-next]").disabled = state.index === state.steps.length - 1;
    }

    function highlightCholeskyStepText(text) {
        return escapeHtml(text).replace(
            /(l_\d+|a_\d+|Column \d+|Press Next|A = L L\^T|R = chol\(A\)|A = R\^T R)/g,
            `<span class="lu-term">$1</span>`
        );
    }

    function identityMatrix(n) {
        return Array.from({ length: n }, (_, row) => Array.from({ length: n }, (_, col) => row === col ? 1 : 0));
    }

    function cloneMatrix(matrix) {
        return matrix.map(row => row.slice());
    }

    function swapRows(matrix, a, b) {
        const temp = matrix[a];
        matrix[a] = matrix[b];
        matrix[b] = temp;
    }

    function transposeArray(matrix) {
        return matrix[0].map((_, col) => matrix.map(row => row[col]));
    }

    function getProcessConfig(type) {
        const configs = {
            "substitution-formula": {
                title: "How the substitution sum is read",
                intro: "Step through one row and watch the symbols i and j become concrete row and column numbers.",
                steps: [
                    {
                        title: "Pick the current row",
                        text: "Take row i = 3 of Ly = b. The unknown y3 is new, but y1 and y2 are already known from the rows above.",
                        formula: ["row 3: -1*y1 + 4*y2 + 2*y3 = 2"],
                        matrices: [
                            { name: "L", data: [[2, 0, 0], [3, 1, 0], [-1, 4, 2]], marks: { "2,0": "known", "2,1": "known", "2,2": "pivot" } },
                            { name: "b", data: [[4], [8], [2]], marks: { "2,0": "target" } }
                        ]
                    },
                    {
                        title: "The j-sum means earlier columns",
                        text: "For i = 3, the sum from j = 1 to i - 1 means j = 1 and j = 2. Those are the known terms in the same row.",
                        formula: ["sum_{j=1}^{2} l_3j*y_j = l31*y1 + l32*y2", "= (-1)*2 + 4*2 = 6"],
                        matrices: [
                            { name: "known terms", data: [["l31*y1", "l32*y2", "l33*y3"], ["-1*2", "4*2", "2*y3"]], marks: { "1,0": "known", "1,1": "known", "1,2": "pivot" } }
                        ]
                    },
                    {
                        title: "Subtract known terms",
                        text: "Move the already-known part to the right side. Only the diagonal term with y3 remains on the left.",
                        formula: ["2*y3 = 2 - 6", "2*y3 = -4"],
                        matrices: [
                            { name: "row 3", data: [["known sum", "diagonal term", "right side"], [6, "2*y3", 2]], marks: { "1,0": "known", "1,1": "pivot", "1,2": "target" } }
                        ]
                    },
                    {
                        title: "Divide by the diagonal",
                        text: "The diagonal entry l33 = 2 is the coefficient of y3, so divide by it to get the new unknown.",
                        formula: ["y3 = (2 - 6) / 2 = -2"],
                        matrices: [
                            { name: "computed vector y", data: [["y1"], [2], ["y2"], [2], ["y3"], [-2]], marks: { "5,0": "new" } }
                        ]
                    }
                ]
            },
            gaussian: {
                title: "Gaussian elimination stepper",
                intro: "Watch row operations turn a full system into an upper triangular one.",
                steps: [
                    {
                        title: "Start with the augmented system",
                        text: "The last column is the right side b. The first pivot is a11 = 2.",
                        formula: ["Use row 1 to eliminate the entries below it in column 1."],
                        matrices: [
                            { name: "[A | b]", data: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]], marks: { "0,0": "pivot", "1,0": "target", "2,0": "target" } }
                        ]
                    },
                    {
                        title: "Eliminate below the first pivot",
                        text: "Add 3/2 of row 1 to row 2, and add row 1 to row 3. This creates zeros below the pivot.",
                        formula: ["R2 <- R2 + (3/2)R1", "R3 <- R3 + R1"],
                        matrices: [
                            { name: "[A | b]", data: [[2, 1, -1, 8], [0, 0.5, 0.5, 1], [0, 2, 1, 5]], marks: { "0,0": "pivot", "1,0": "zero", "2,0": "zero", "1,1": "target", "2,1": "target" } }
                        ]
                    },
                    {
                        title: "Use the second pivot",
                        text: "Now the pivot is a22 = 0.5. The multiplier for row 3 is 2 / 0.5 = 4.",
                        formula: ["R3 <- R3 - 4R2"],
                        matrices: [
                            { name: "[A | b]", data: [[2, 1, -1, 8], [0, 0.5, 0.5, 1], [0, 0, -1, 1]], marks: { "1,1": "pivot", "2,1": "zero", "2,2": "target" } }
                        ]
                    },
                    {
                        title: "Upper triangular system",
                        text: "All entries below the diagonal are zero. Now backward substitution can recover the unknowns from bottom to top.",
                        formula: ["-z = 1", "0.5y + 0.5z = 1", "2x + y - z = 8"],
                        matrices: [
                            { name: "U | c", data: [[2, 1, -1, 8], [0, 0.5, 0.5, 1], [0, 0, -1, 1]], marks: { "0,0": "pivot", "1,1": "pivot", "2,2": "pivot" } }
                        ]
                    }
                ]
            },
            pivoting: {
                title: "Why pivoting changes the row order",
                intro: "Compare a tiny pivot with the row swap chosen by partial pivoting.",
                steps: [
                    {
                        title: "Tiny pivot problem",
                        text: "If we use 0.001 as pivot, the multiplier below it is 1 / 0.001 = 1000. Large multipliers can magnify rounding error.",
                        formula: ["bad multiplier: m21 = 1000"],
                        matrices: [
                            { name: "[A | b]", data: [[0.001, 1, 1], [1, 1, 2]], marks: { "0,0": "pivot", "1,0": "target" } }
                        ]
                    },
                    {
                        title: "Choose the largest available pivot",
                        text: "Partial pivoting looks down the current column and chooses the entry with largest absolute value. Here |1| is better than |0.001|.",
                        formula: ["swap row 1 and row 2"],
                        matrices: [
                            { name: "before swap", data: [[0.001, 1, 1], [1, 1, 2]], marks: { "0,0": "target", "1,0": "pivot" } },
                            { name: "after swap", data: [[1, 1, 2], [0.001, 1, 1]], marks: { "0,0": "pivot" } }
                        ]
                    },
                    {
                        title: "Eliminate with a small multiplier",
                        text: "After the swap, the multiplier is only 0.001. The row update is gentle instead of huge.",
                        formula: ["R2 <- R2 - 0.001R1"],
                        matrices: [
                            { name: "[A | b]", data: [[1, 1, 2], [0, 0.999, 0.998]], marks: { "0,0": "pivot", "1,0": "zero", "1,1": "new", "1,2": "new" } }
                        ]
                    }
                ]
            },
            lu: {
                title: "LU from one elimination step",
                intro: "See how the row operation that creates U is saved inside L.",
                steps: [
                    {
                        title: "Start with A",
                        text: "For this 2 by 2 example no row swap is needed, so P is the identity matrix.",
                        formula: ["A = [[4, 3], [6, 3]]"],
                        matrices: [
                            { name: "A", data: [[4, 3], [6, 3]], marks: { "0,0": "pivot", "1,0": "target" } },
                            { name: "P", data: [[1, 0], [0, 1]] }
                        ]
                    },
                    {
                        title: "Compute the multiplier",
                        text: "To eliminate the 6 below the pivot 4, use m21 = 6 / 4 = 1.5. This number is stored in L.",
                        formula: ["m21 = a21 / a11 = 6 / 4 = 1.5"],
                        matrices: [
                            { name: "L", data: [[1, 0], [1.5, 1]], marks: { "1,0": "stored" } }
                        ]
                    },
                    {
                        title: "Update the row to make U",
                        text: "Row 2 becomes row 2 minus 1.5 times row 1.",
                        formula: ["R2 <- R2 - 1.5R1", "[6, 3] - 1.5[4, 3] = [0, -1.5]"],
                        matrices: [
                            { name: "U", data: [[4, 3], [0, -1.5]], marks: { "1,0": "zero", "1,1": "new" } }
                        ]
                    },
                    {
                        title: "The stored result",
                        text: "The factorization records the same work as elimination: PA = LU. Here P is identity, so A = LU.",
                        formula: ["L*U = A"],
                        matrices: [
                            { name: "L", data: [[1, 0], [1.5, 1]], marks: { "1,0": "stored" } },
                            { name: "U", data: [[4, 3], [0, -1.5]], marks: { "1,0": "zero" } }
                        ]
                    }
                ]
            },
            "lu-storage": {
                title: "Where the multipliers go",
                intro: "A 3 by 3 example shows U being formed while L collects the multipliers.",
                steps: [
                    {
                        title: "First pivot",
                        text: "Use pivot a11 = 2. The multipliers are m21 = 4/2 = 2 and m31 = -2/2 = -1.",
                        formula: ["R2 <- R2 - 2R1", "R3 <- R3 - (-1)R1"],
                        matrices: [
                            { name: "working matrix", data: [[2, 1, 1], [4, 3, 3], [-2, 2, 3]], marks: { "0,0": "pivot", "1,0": "target", "2,0": "target" } },
                            { name: "L storage", data: [[1, 0, 0], [2, 1, 0], [-1, 0, 1]], marks: { "1,0": "stored", "2,0": "stored" } }
                        ]
                    },
                    {
                        title: "After first column is cleared",
                        text: "The first column below the pivot is now zero in U. The multipliers remain in L.",
                        formula: ["column 1 below the diagonal is cleared"],
                        matrices: [
                            { name: "working U", data: [[2, 1, 1], [0, 1, 1], [0, 3, 4]], marks: { "1,0": "zero", "2,0": "zero", "1,1": "pivot", "2,1": "target" } },
                            { name: "L", data: [[1, 0, 0], [2, 1, 0], [-1, 0, 1]], marks: { "1,0": "stored", "2,0": "stored" } }
                        ]
                    },
                    {
                        title: "Second pivot",
                        text: "Use pivot a22 = 1. The multiplier is m32 = 3/1 = 3, so store 3 in L and eliminate the 3 below the pivot.",
                        formula: ["R3 <- R3 - 3R2"],
                        matrices: [
                            { name: "working U", data: [[2, 1, 1], [0, 1, 1], [0, 0, 1]], marks: { "1,1": "pivot", "2,1": "zero", "2,2": "new" } },
                            { name: "L", data: [[1, 0, 0], [2, 1, 0], [-1, 3, 1]], marks: { "2,1": "stored" } }
                        ]
                    },
                    {
                        title: "Final factors",
                        text: "U is upper triangular. L has ones on the diagonal and the stored elimination multipliers below it.",
                        formula: ["A = L*U when no row swaps are used"],
                        matrices: [
                            { name: "L", data: [[1, 0, 0], [2, 1, 0], [-1, 3, 1]], marks: { "1,0": "stored", "2,0": "stored", "2,1": "stored" } },
                            { name: "U", data: [[2, 1, 1], [0, 1, 1], [0, 0, 1]], marks: { "1,0": "zero", "2,0": "zero", "2,1": "zero" } }
                        ]
                    }
                ]
            },
            cholesky: {
                title: "Building Cholesky entries",
                intro: "Match A = LL^T entry by entry for A = [[4,2],[2,3]].",
                steps: [
                    {
                        title: "Choose the lower triangular shape",
                        text: "Because A is symmetric positive definite, we look for a lower triangular L with positive diagonal entries.",
                        formula: ["L = [[l11, 0], [l21, l22]]"],
                        matrices: [
                            { name: "A", data: [[4, 2], [2, 3]] },
                            { name: "L", data: [["l11", 0], ["l21", "l22"]], marks: { "0,0": "target", "1,0": "target", "1,1": "target" } }
                        ]
                    },
                    {
                        title: "First diagonal entry",
                        text: "Match the (1,1) entry: l11^2 = 4, so l11 = 2.",
                        formula: ["l11 = sqrt(4) = 2"],
                        matrices: [
                            { name: "L", data: [[2, 0], ["l21", "l22"]], marks: { "0,0": "new" } }
                        ]
                    },
                    {
                        title: "First off-diagonal entry",
                        text: "Match the (2,1) entry: l21*l11 = 2. Since l11 = 2, l21 = 1.",
                        formula: ["l21 = 2 / 2 = 1"],
                        matrices: [
                            { name: "L", data: [[2, 0], [1, "l22"]], marks: { "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Second diagonal entry",
                        text: "Match the (2,2) entry: l21^2 + l22^2 = 3. Therefore l22 = sqrt(3 - 1^2) = sqrt(2).",
                        formula: ["l22 = sqrt(3 - 1) = 1.4142"],
                        matrices: [
                            { name: "L", data: [[2, 0], [1, 1.4142]], marks: { "1,1": "new" } },
                            { name: "R = L^T", data: [[2, 1], [0, 1.4142]] }
                        ]
                    }
                ]
            },
            "qr-factorization": {
                title: "QR splits columns into directions and coefficients",
                intro: "Step through the meaning of A = QR before trusting the MATLAB command.",
                steps: [
                    {
                        title: "Start from columns of A",
                        text: "Think of A as a list of column vectors. QR will replace them by perpendicular unit directions plus coefficients.",
                        formula: ["A = [a1 a2]"],
                        matrices: [
                            { name: "A", data: [[1, 2], [3, 4], [5, 6]], marks: { "0,0": "target", "1,0": "target", "2,0": "target" } }
                        ]
                    },
                    {
                        title: "Build Q",
                        text: "Q stores directions with length 1 and perpendicular columns. These directions form a cleaner coordinate system.",
                        formula: ["Q^T Q = I"],
                        matrices: [
                            { name: "Q^T Q", data: [[1, 0], [0, 1]], marks: { "0,0": "new", "1,1": "new", "0,1": "zero", "1,0": "zero" } }
                        ]
                    },
                    {
                        title: "Build R",
                        text: "R stores how much of each Q direction is needed to reconstruct each original column. Entries below the diagonal are zero.",
                        formula: ["A = Q R"],
                        matrices: [
                            { name: "R", data: [["r11", "r12"], [0, "r22"]], marks: { "1,0": "zero", "0,0": "pivot", "1,1": "pivot" } }
                        ]
                    }
                ]
            },
            "qr-construction": {
                title: "Gram-Schmidt construction",
                intro: "Watch one column get cleaned by removing the part already explained by the previous Q direction.",
                steps: [
                    {
                        title: "Normalize the first column",
                        text: "The first Q direction is the first column divided by its length.",
                        formula: ["q1 = a1 / ||a1||", "r11 = ||a1||"],
                        matrices: [
                            { name: "a1", data: [[1], [3], [5]], marks: { "0,0": "target", "1,0": "target", "2,0": "target" } },
                            { name: "q1", data: [[0.169], [0.507], [0.845]], marks: { "0,0": "new", "1,0": "new", "2,0": "new" } }
                        ]
                    },
                    {
                        title: "Measure overlap with q1",
                        text: "The number r12 tells how much of a2 lies in the q1 direction.",
                        formula: ["r12 = q1^T a2"],
                        matrices: [
                            { name: "projection coefficient", data: [["q1^T a2"], [7.437]], marks: { "1,0": "stored" } }
                        ]
                    },
                    {
                        title: "Remove the old direction",
                        text: "Subtract the q1 part from a2. The remaining vector is perpendicular to q1.",
                        formula: ["u2 = a2 - r12*q1"],
                        matrices: [
                            { name: "u2", data: [[0.743], [0.229], [-0.286]], marks: { "0,0": "new", "1,0": "new", "2,0": "new" } }
                        ]
                    },
                    {
                        title: "Normalize the remainder",
                        text: "The second Q direction is the cleaned vector divided by its length.",
                        formula: ["q2 = u2 / ||u2||", "r22 = ||u2||"],
                        matrices: [
                            { name: "Q", data: [[0.169, 0.898], [0.507, 0.276], [0.845, -0.345]], marks: { "0,1": "new", "1,1": "new", "2,1": "new" } },
                            { name: "R", data: [[5.916, 7.437], [0, 0.828]], marks: { "1,0": "zero", "1,1": "new" } }
                        ]
                    }
                ]
            },
            "qr-orthogonality": {
                title: "Why Q is gentle on errors",
                intro: "Orthogonal matrices rotate or reflect; they do not stretch vector length.",
                steps: [
                    {
                        title: "Start with a vector",
                        text: "Take x = [3; 4]. Its length is 5.",
                        formula: ["||x|| = sqrt(3^2 + 4^2) = 5"],
                        matrices: [
                            { name: "x", data: [[3], [4]], marks: { "0,0": "target", "1,0": "target" } }
                        ]
                    },
                    {
                        title: "Apply an orthogonal Q",
                        text: "A rotation by 90 degrees changes direction but not length.",
                        formula: ["Q = [[0,-1],[1,0]]", "Qx = [-4; 3]"],
                        matrices: [
                            { name: "Q", data: [[0, -1], [1, 0]] },
                            { name: "Qx", data: [[-4], [3]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Length is preserved",
                        text: "The transformed vector still has length 5, so rounding errors are not amplified by Q itself.",
                        formula: ["||Qx|| = sqrt((-4)^2 + 3^2) = 5"],
                        matrices: [
                            { name: "Q^T Q", data: [[1, 0], [0, 1]], marks: { "0,0": "new", "1,1": "new" } }
                        ]
                    }
                ]
            },
            "least-squares": {
                title: "Best fit when equations disagree",
                intro: "Least squares chooses the line whose residual vector is shortest.",
                steps: [
                    {
                        title: "Too many equations",
                        text: "Three data points are being fit by two unknowns: intercept and slope.",
                        formula: ["A x approx b"],
                        matrices: [
                            { name: "A", data: [[1, 1], [1, 2], [1, 3]] },
                            { name: "b", data: [[1], [2], [2]] }
                        ]
                    },
                    {
                        title: "Candidate fit",
                        text: "One good fit is x = [0.667; 0.5], which predicts values near the data.",
                        formula: ["Ax = [1.167; 1.667; 2.167]"],
                        matrices: [
                            { name: "x", data: [[0.667], [0.5]], marks: { "0,0": "new", "1,0": "new" } },
                            { name: "Ax", data: [[1.167], [1.667], [2.167]] }
                        ]
                    },
                    {
                        title: "Residual is unavoidable",
                        text: "The residual Ax - b is not zero because no single line passes exactly through all three points.",
                        formula: ["r = Ax - b = [0.167; -0.333; 0.167]"],
                        matrices: [
                            { name: "residual", data: [[0.167], [-0.333], [0.167]], marks: { "0,0": "target", "1,0": "target", "2,0": "target" } }
                        ]
                    }
                ]
            },
            "least-squares-deep": {
                title: "Projection and normal equations",
                intro: "The best fit makes the residual perpendicular to the columns of A.",
                steps: [
                    {
                        title: "Column space target",
                        text: "Ax always lives in the column space of A. Least squares finds the point Ax closest to b in that space.",
                        formula: ["projection of b onto Col(A)"],
                        matrices: [
                            { name: "A columns", data: [[1, 1], [1, 2], [1, 3]], marks: { "0,0": "known", "1,0": "known", "2,0": "known" } }
                        ]
                    },
                    {
                        title: "Residual condition",
                        text: "At the closest point, the residual is perpendicular to every column of A.",
                        formula: ["A^T(Ax - b) = 0"],
                        matrices: [
                            { name: "A^T r", data: [[0], [0]], marks: { "0,0": "zero", "1,0": "zero" } }
                        ]
                    },
                    {
                        title: "Normal equations",
                        text: "Rearranging the perpendicularity condition gives the normal equations.",
                        formula: ["A^T A x = A^T b"],
                        matrices: [
                            { name: "A^T A", data: [[3, 6], [6, 14]], marks: { "0,0": "new", "1,1": "new" } },
                            { name: "A^T b", data: [[5], [11]] }
                        ]
                    },
                    {
                        title: "Why QR is preferred",
                        text: "QR solves the same projection problem using length-preserving Q instead of forming A^T A directly.",
                        formula: ["A = QR", "min ||Ax-b|| = min ||Rx-Q^T b||"],
                        matrices: [
                            { name: "R", data: [["*", "*"], [0, "*"]], marks: { "1,0": "zero" } }
                        ]
                    }
                ]
            },
            eigenvalues: {
                title: "Direction that survives a matrix",
                intro: "An eigenvector changes length but not direction.",
                steps: [
                    {
                        title: "Try v = [1; 1]",
                        text: "For A = [[2,1],[1,2]], multiplying by A keeps the same direction.",
                        formula: ["A v = [3; 3] = 3v"],
                        matrices: [
                            { name: "A", data: [[2, 1], [1, 2]] },
                            { name: "v", data: [[1], [1]], marks: { "0,0": "target", "1,0": "target" } },
                            { name: "Av", data: [[3], [3]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Eigenvalue is the stretch",
                        text: "The vector is multiplied by 3, so lambda = 3.",
                        formula: ["Av = lambda v", "lambda = 3"],
                        matrices: [
                            { name: "same direction", data: [["v"], ["3v"]], marks: { "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Another eigen-direction",
                        text: "The vector [1; -1] also keeps its direction, but it is stretched by 1.",
                        formula: ["A[1;-1] = [1;-1]"],
                        matrices: [
                            { name: "Av", data: [[1], [-1]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    }
                ]
            },
            "eigenvalues-deep": {
                title: "Characteristic equation in 2 by 2",
                intro: "See how det(A - lambda I) = 0 appears from the eigenvector equation.",
                steps: [
                    {
                        title: "Move lambda v to the left",
                        text: "The equation Av = lambda v is equivalent to (A - lambda I)v = 0.",
                        formula: ["(A - lambda I)v = 0"],
                        matrices: [
                            { name: "A - lambda I", data: [["2-lambda", 1], [1, "2-lambda"]], marks: { "0,0": "target", "1,1": "target" } }
                        ]
                    },
                    {
                        title: "Need a singular matrix",
                        text: "A nonzero v can solve this homogeneous system only when A - lambda I is singular.",
                        formula: ["det(A - lambda I) = 0"],
                        matrices: [
                            { name: "det", data: [["(2-lambda)^2 - 1"]], marks: { "0,0": "target" } }
                        ]
                    },
                    {
                        title: "Solve the polynomial",
                        text: "The characteristic equation gives lambda = 1 and lambda = 3.",
                        formula: ["(2-lambda)^2 - 1 = 0", "lambda = 1, 3"],
                        matrices: [
                            { name: "eigenvalues", data: [[1], [3]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    }
                ]
            },
            "power-method": {
                title: "Power iteration alignment",
                intro: "Repeated multiplication by A turns a generic vector toward the dominant eigenvector.",
                steps: [
                    {
                        title: "Start with a mixed vector",
                        text: "The initial vector [1;0] contains some of both eigen-directions.",
                        formula: ["x0 = [1; 0]"],
                        matrices: [
                            { name: "x0", data: [[1], [0]], marks: { "0,0": "target", "1,0": "target" } }
                        ]
                    },
                    {
                        title: "Multiply once",
                        text: "Multiplication by A gives [2;1]. The direction has moved closer to [1;1].",
                        formula: ["y1 = A x0 = [2; 1]"],
                        matrices: [
                            { name: "y1", data: [[2], [1]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Normalize",
                        text: "Scaling the vector prevents growth. Only direction matters for the eigenvector.",
                        formula: ["x1 = y1 / ||y1||"],
                        matrices: [
                            { name: "x1", data: [[0.894], [0.447]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Repeat",
                        text: "After more iterations the entries become closer to equal, matching the dominant eigenvector direction.",
                        formula: ["xk -> [0.707; 0.707]"],
                        matrices: [
                            { name: "dominant direction", data: [[0.707], [0.707]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    }
                ]
            },
            "power-method-deep": {
                title: "Why the dominant component wins",
                intro: "Decompose the start vector into eigenvectors and track their scaling.",
                steps: [
                    {
                        title: "Write x0 in eigenvectors",
                        text: "For this example, x0 = [1;0] is a mixture of v1 = [1;1] and v2 = [1;-1].",
                        formula: ["x0 = 0.5 v1 + 0.5 v2"],
                        matrices: [
                            { name: "components", data: [["0.5 v1"], ["0.5 v2"]], marks: { "0,0": "known", "1,0": "known" } }
                        ]
                    },
                    {
                        title: "Apply A repeatedly",
                        text: "Each multiplication scales each component by its eigenvalue.",
                        formula: ["A^k x0 = 0.5*3^k v1 + 0.5*1^k v2"],
                        matrices: [
                            { name: "after k steps", data: [["0.5*3^k"], ["0.5*1^k"]], marks: { "0,0": "new", "1,0": "target" } }
                        ]
                    },
                    {
                        title: "Normalize",
                        text: "After normalization, the 3^k component dominates and the 1^k component becomes relatively small.",
                        formula: ["relative size = (1/3)^k"],
                        matrices: [
                            { name: "component ratio", data: [["k=1", "0.333"], ["k=3", "0.037"], ["k=6", "0.00137"]], marks: { "2,1": "new" } }
                        ]
                    },
                    {
                        title: "Estimate lambda",
                        text: "The Rayleigh quotient turns the current direction into a scalar eigenvalue estimate.",
                        formula: ["lambda approx (x^T A x)/(x^T x)"],
                        matrices: [
                            { name: "estimate", data: [[2], [2.8], [2.98], [3]], marks: { "3,0": "new" } }
                        ]
                    }
                ]
            },
            "inverse-power": {
                title: "Inverse iteration targets small eigenvalues",
                intro: "Solving Ax = previous vector has the same eigenvectors but flips eigenvalue sizes.",
                steps: [
                    {
                        title: "Eigenvalues invert",
                        text: "If A has eigenvalues 3 and 1, then A^{-1} has eigenvalues 1/3 and 1.",
                        formula: ["A v = lambda v", "A^{-1}v = (1/lambda)v"],
                        matrices: [
                            { name: "lambda(A)", data: [[3], [1]] },
                            { name: "lambda(A^{-1})", data: [[0.333], [1]], marks: { "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Dominant after inversion",
                        text: "The smallest eigenvalue of A becomes the largest eigenvalue of A^{-1}.",
                        formula: ["inverse power finds eigenvalue closest to 0"],
                        matrices: [
                            { name: "target", data: [["lambda = 1"]], marks: { "0,0": "target" } }
                        ]
                    },
                    {
                        title: "Do not form inverse",
                        text: "In computation, solve A y = x at each step instead of building A^{-1}.",
                        formula: ["A y_k = x_{k-1}", "x_k = y_k / ||y_k||"],
                        matrices: [
                            { name: "linear solve", data: [["A", "y"], ["=", "x"]], marks: { "1,1": "new" } }
                        ]
                    }
                ]
            },
            "inverse-power-deep": {
                title: "Shifted inverse targeting",
                intro: "A shift mu moves the eigenvalue you want close to zero before inversion.",
                steps: [
                    {
                        title: "Shift the matrix",
                        text: "If lambda is an eigenvalue of A, then lambda - mu is an eigenvalue of A - mu I.",
                        formula: ["(A - mu I)v = (lambda - mu)v"],
                        matrices: [
                            { name: "lambda(A)", data: [[1], [3]] },
                            { name: "lambda - mu, mu=2.8", data: [[-1.8], [0.2]], marks: { "1,0": "target" } }
                        ]
                    },
                    {
                        title: "Invert the shifted matrix",
                        text: "After inversion, the eigenvalue nearest the shift becomes largest in magnitude.",
                        formula: ["1/(lambda - mu)"],
                        matrices: [
                            { name: "inverted shifted values", data: [[-0.556], [5]], marks: { "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Recover the target",
                        text: "The direction found belongs to the eigenvalue of A closest to mu.",
                        formula: ["mu = 2.8 targets lambda = 3"],
                        matrices: [
                            { name: "targeted eigenvalue", data: [[3]], marks: { "0,0": "new" } }
                        ]
                    }
                ]
            },
            "qr-eigen-method": {
                title: "One QR eigenvalue step",
                intro: "Factor A_k = Q_k R_k, then reverse the order to form A_{k+1} = R_k Q_k.",
                steps: [
                    {
                        title: "Start with A0",
                        text: "The method begins with the matrix whose eigenvalues we want.",
                        formula: ["A0 = A"],
                        matrices: [
                            { name: "A0", data: [[2, 1], [1, 2]], marks: { "0,0": "target", "1,1": "target" } }
                        ]
                    },
                    {
                        title: "QR factorization",
                        text: "Write A0 as Q0 R0. Q0 is orthogonal and R0 is upper triangular.",
                        formula: ["A0 = Q0 R0"],
                        matrices: [
                            { name: "Q0", data: [[0.894, -0.447], [0.447, 0.894]] },
                            { name: "R0", data: [[2.236, 1.789], [0, 1.342]], marks: { "1,0": "zero" } }
                        ]
                    },
                    {
                        title: "Reverse the factors",
                        text: "Build the next matrix by multiplying R0 Q0. This keeps the same eigenvalues.",
                        formula: ["A1 = R0 Q0"],
                        matrices: [
                            { name: "A1", data: [[2.8, 0.6], [0.6, 1.2]], marks: { "0,0": "new", "1,1": "new" } }
                        ]
                    },
                    {
                        title: "Diagonal values move toward eigenvalues",
                        text: "Repeating the process pushes off-diagonal entries toward zero for many symmetric examples.",
                        formula: ["diag(Ak) -> eigenvalues"],
                        matrices: [
                            { name: "later Ak", data: [[2.99, 0.08], [0.08, 1.01]], marks: { "0,0": "new", "1,1": "new", "0,1": "target", "1,0": "target" } }
                        ]
                    }
                ]
            },
            "qr-eigen-deep": {
                title: "Why QR iteration preserves eigenvalues",
                intro: "The reversed product is similar to the original matrix.",
                steps: [
                    {
                        title: "Start from A = QR",
                        text: "Because Q is orthogonal, Q^{-1} = Q^T.",
                        formula: ["A = Q R"],
                        matrices: [
                            { name: "Q^T Q", data: [[1, 0], [0, 1]], marks: { "0,0": "new", "1,1": "new" } }
                        ]
                    },
                    {
                        title: "Reverse product is similar",
                        text: "A1 = RQ can be written as Q^T A Q, so A1 is similar to A.",
                        formula: ["A1 = RQ = Q^T A Q"],
                        matrices: [
                            { name: "similarity", data: [["Q^T", "A", "Q"]], marks: { "0,1": "target" } }
                        ]
                    },
                    {
                        title: "Same eigenvalues",
                        text: "Similar matrices have the same eigenvalues. QR iteration changes the matrix shape, not its spectrum.",
                        formula: ["eig(A1) = eig(A)"],
                        matrices: [
                            { name: "eigenvalues", data: [[3], [1]], marks: { "0,0": "new", "1,0": "new" } }
                        ]
                    },
                    {
                        title: "Shifts accelerate the process",
                        text: "Practical QR algorithms subtract a shift, perform QR, then add the shift back to make convergence faster.",
                        formula: ["A - mu I = QR", "A_next = RQ + mu I"],
                        matrices: [
                            { name: "shifted step", data: [["A-mu I"], ["QR"], ["RQ+mu I"]], marks: { "2,0": "new" } }
                        ]
                    }
                ]
            }
        };

        return configs[type];
    }

    function renderProcessStep(card, state) {
        const step = state.steps[state.index];
        const stage = card.querySelector("[data-role='stage']");
        const output = card.querySelector("[data-role='output']");
        const progress = card.querySelector("[data-role='progress']");
        const prev = card.querySelector("[data-action='prev']");
        const next = card.querySelector("[data-action='next']");

        stage.innerHTML = `
            <div class="process-matrices">
                ${step.matrices.map(renderProcessMatrix).join("")}
            </div>
        `;
        output.innerHTML = `
            <h4>${escapeHtml(step.title)}</h4>
            <p>${escapeHtml(step.text)}</p>
            ${step.formula?.length ? `<div class="process-formulas">${step.formula.map(line => `<code>${escapeHtml(line)}</code>`).join("")}</div>` : ""}
        `;
        progress.textContent = `${state.index + 1} / ${state.steps.length}`;
        prev.disabled = state.index === 0;
        next.disabled = state.index === state.steps.length - 1;
    }

    function renderProcessMatrix(matrix) {
        const columnCount = matrix.data[0]?.length || 1;
        return `
            <div class="process-matrix-wrap">
                <div class="grid-label">${escapeHtml(matrix.name)}</div>
                <div class="process-matrix" style="grid-template-columns: repeat(${columnCount}, minmax(44px, 1fr));">
                    ${matrix.data.map((row, rowIndex) => row.map((value, colIndex) => {
                        const mark = matrix.marks?.[`${rowIndex},${colIndex}`] || "";
                        return `<div class="process-cell ${mark}">${escapeHtml(formatProcessValue(value))}</div>`;
                    }).join("")).join("")}
                </div>
            </div>
        `;
    }

    function formatProcessValue(value) {
        return typeof value === "number" ? formatNumber(value) : value;
    }

    function parseMatrixData(text) {
        return text.split(";").map(row => row.split(",").map(Number));
    }

    function parseVectorData(text) {
        return text.split(";").map(Number);
    }

    function renderSubstitutionEditor(card, matrix, vector) {
        const editor = card.querySelector("[data-role='editor']");
        const n = matrix.length;
        const unknown = card.dataset.mode === "backward" ? "x" : "y";
        const matrixName = card.dataset.mode === "backward" ? "U" : "L";
        const rightSideName = card.dataset.mode === "backward" ? "y" : "b";
        const matrixCells = matrix.map((row, rowIndex) => `
            <div class="matrix-row">
                ${row.map((value, colIndex) => {
                    const structuralZero = card.dataset.mode === "backward" ? rowIndex > colIndex : colIndex > rowIndex;
                    return `
                    <label class="matrix-cell ${structuralZero ? "structural-zero" : ""}" data-cell-row="${rowIndex}" data-cell-col="${colIndex}">
                        <span>${rowIndex + 1},${colIndex + 1}</span>
                        <input type="number" step="any" value="${structuralZero ? 0 : value}" data-kind="matrix" data-row="${rowIndex}" data-col="${colIndex}" ${structuralZero ? "disabled" : ""}>
                    </label>
                `; }).join("")}
            </div>
        `).join("");
        const vectorCells = vector.map((value, rowIndex) => `
            <label class="matrix-cell vector-cell" data-vector-row="${rowIndex}">
                <span>${rowIndex + 1}</span>
                <input type="number" step="any" value="${value}" data-kind="vector" data-row="${rowIndex}">
            </label>
        `).join("");
        const unknownCells = Array.from({ length: n }, (_, rowIndex) => `
            <div class="unknown-cell" data-unknown-row="${rowIndex}">${unknown}${rowIndex + 1}</div>
        `).join("");
        const solutionCells = Array.from({ length: n }, (_, rowIndex) => `
            <div class="solution-cell" data-solution-row="${rowIndex}">${unknown}${rowIndex + 1} = ?</div>
        `).join("");

        editor.innerHTML = `
            <div class="substitution-caption">
                <strong>Solve ${matrixName}${unknown} = ${rightSideName}</strong>
                <span>Edit the active triangular entries. Locked boxes stay zero so the matrix remains ${card.dataset.mode === "backward" ? "upper" : "lower"} triangular.</span>
            </div>
            <div class="editable-hint">Editable inputs</div>
            <div class="substitution-equation">
                <div>
                    <div class="grid-label">${matrixName} matrix</div>
                    <div class="matrix-grid">${matrixCells}</div>
                </div>
                <div>
                    <div class="grid-label">unknowns</div>
                    <div class="unknown-grid">${unknownCells}</div>
                </div>
                <div class="equation-symbol">=</div>
                <div>
                    <div class="grid-label">right side ${rightSideName}</div>
                    <div class="vector-grid">${vectorCells}</div>
                </div>
                <div>
                    <div class="grid-label">computed values</div>
                    <div class="solution-grid">${solutionCells}</div>
                </div>
            </div>
        `;
    }

    function readMatrixGrid(card) {
        const inputs = [...card.querySelectorAll("input[data-kind='matrix']")];
        const n = Math.sqrt(inputs.length);
        if (!Number.isInteger(n)) throw new Error("Matrix grid is invalid.");
        const matrix = Array.from({ length: n }, () => Array(n).fill(0));
        inputs.forEach(input => {
            const value = Number(input.value);
            if (!Number.isFinite(value)) throw new Error("Every matrix box must contain a number.");
            matrix[Number(input.dataset.row)][Number(input.dataset.col)] = value;
        });
        return matrix;
    }

    function readVectorGrid(card) {
        return [...card.querySelectorAll("input[data-kind='vector']")].map(input => {
            const value = Number(input.value);
            if (!Number.isFinite(value)) throw new Error("Every right-side box must contain a number.");
            return value;
        });
    }

    function buildSubstitutionSteps(matrix, vector, mode) {
        const n = matrix.length;
        if (vector.length !== n) throw new Error("Vector length must match the matrix size.");
        if (matrix.some(row => row.length !== n)) throw new Error("Matrix must be square.");
        validateTriangularMatrix(matrix, mode);
        const solution = Array(n).fill(null);
        const steps = [];
        const indices = mode === "backward"
            ? Array.from({ length: n }, (_, index) => n - 1 - index)
            : Array.from({ length: n }, (_, index) => index);

        indices.forEach(row => {
            const knownColumns = mode === "backward"
                ? Array.from({ length: n - row - 1 }, (_, offset) => row + 1 + offset)
                : Array.from({ length: row }, (_, index) => index);
            const knownSum = knownColumns.reduce((sum, col) => sum + matrix[row][col] * solution[col], 0);
            const pivot = matrix[row][row];
            if (Math.abs(pivot) < 1e-12) throw new Error(`Zero pivot on row ${row + 1}.`);
            const value = (vector[row] - knownSum) / pivot;
            solution[row] = value;
            const unknown = mode === "backward" ? "x" : "y";
            const terms = knownColumns
                .map(col => `${formatNumber(matrix[row][col])}${unknown}${col + 1}`)
                .join(" + ") || "0";
            steps.push({
                row,
                knownColumns,
                knownSum,
                pivot,
                value,
                solution: [...solution],
                title: `${mode === "backward" ? "Backward" : "Forward"} step ${steps.length + 1}`,
                equation: `row ${row + 1}: ${formatNumber(pivot)}${unknown}${row + 1} + ${terms} = ${formatNumber(vector[row])}`,
                derivation: `${unknown}${row + 1} = (${formatNumber(vector[row])} - ${formatNumber(knownSum)}) / ${formatNumber(pivot)} = ${formatNumber(value)}`
            });
        });

        return steps;
    }

    function validateTriangularMatrix(matrix, mode) {
        const isBackward = mode === "backward";
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix.length; col++) {
                const shouldBeZero = isBackward ? row > col : col > row;
                if (shouldBeZero && Math.abs(matrix[row][col]) > 1e-12) {
                    throw new Error(`Use a ${isBackward ? "upper" : "lower"} triangular matrix: entry (${row + 1},${col + 1}) must be 0.`);
                }
            }
        }
    }

    function renderSubstitutionStep(card, state) {
        const output = card.querySelector("[data-role='output']");
        if (!state.steps.length) {
            output.innerHTML = "";
            return;
        }
        const step = state.steps[state.index];
        markSubstitutionGrid(card, step);
        drawSubstitutionFrame(card, {
            matrix: state.matrix,
            vector: state.vector,
            step,
            mode: card.dataset.mode
        });
        const values = step.solution.map((value, index) => {
            const known = value !== null;
            return `<span class="${known ? "known" : ""}">${card.dataset.mode === "backward" ? "x" : "y"}${index + 1} = ${known ? formatNumber(value) : "?"}</span>`;
        }).join("");
        output.innerHTML = `
            <div class="step-count">${state.index + 1} / ${state.steps.length}</div>
            <h4>${escapeHtml(step.title)}</h4>
            <p class="step-note">${escapeHtml(card.dataset.mode === "backward" ? "Read this row after the values below it are known." : "Read this row after the values above it are known.")}</p>
            <p>${escapeHtml(step.equation)}</p>
            <p>${escapeHtml(step.derivation)}</p>
            <div class="solution-strip">${values}</div>
        `;
    }

    function markSubstitutionGrid(card, step) {
        card.querySelectorAll(".matrix-cell, .solution-cell").forEach(item => {
            item.classList.remove("active-row", "pivot-cell", "known-cell", "current-solution");
        });
        card.querySelectorAll(`[data-cell-row="${step.row}"], [data-vector-row="${step.row}"]`).forEach(item => {
            item.classList.add("active-row");
        });
        card.querySelector(`[data-cell-row="${step.row}"][data-cell-col="${step.row}"]`)?.classList.add("pivot-cell");
        step.knownColumns.forEach(col => {
            card.querySelector(`[data-cell-row="${step.row}"][data-cell-col="${col}"]`)?.classList.add("known-cell");
        });
        card.querySelectorAll("[data-solution-row]").forEach(item => {
            const row = Number(item.dataset.solutionRow);
            const value = step.solution[row];
            item.textContent = `${card.dataset.mode === "backward" ? "x" : "y"}${row + 1} = ${value !== null ? formatNumber(value) : "?"}`;
            if (value !== null) item.classList.add("known-cell");
            if (row === step.row) item.classList.add("current-solution");
        });
    }

    function initializeSubstitutionFrame(card) {
        const frame = card.querySelector(".substitution-frame");
        if (!frame || frame.dataset.ready) return;
        frame.dataset.ready = "true";
        frame.srcdoc = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
html,body{margin:0;width:100%;height:100%;background:#07101f;font-family:Arial,sans-serif;color:#d8e2ee;overflow:hidden}
canvas{width:100%;height:100%;display:block}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
let payload=null;
function fit(){const dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,Math.floor(canvas.clientWidth*dpr));canvas.height=Math.max(1,Math.floor(canvas.clientHeight*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function fmt(v){return Number.isFinite(v)?Number((Math.abs(v)<1e-12?0:v).toPrecision(4)).toString():String(v);}
function rect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.stroke();}
function arrow(x1,y1,x2,y2,color){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-8*Math.cos(a-.5),y2-8*Math.sin(a-.5));ctx.lineTo(x2-8*Math.cos(a+.5),y2-8*Math.sin(a+.5));ctx.closePath();ctx.fill();}
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);ctx.font='12px Arial';ctx.textBaseline='middle';if(!payload){ctx.fillStyle='#93a4bd';ctx.textAlign='left';ctx.fillText('Edit the boxes on the left to build a substitution step.',18,28);return;}const {matrix,vector,step,mode}=payload;const n=matrix.length;const unknown=mode==='backward'?'x':'y';const row=step.row;ctx.textAlign='left';ctx.fillStyle='#9fb2cc';ctx.fillText(mode==='backward'?'Current row of Ux = y':'Current row of Ly = b',18,24);const cell=Math.min(46,Math.max(34,(w-90)/(n+3)));const sx=18,sy=58;ctx.textAlign='center';for(let c=0;c<n;c++){const x=sx+c*cell;const isPivot=c===row;const isKnown=step.knownColumns.includes(c);ctx.fillStyle=isPivot?'#48b8e8':isKnown?'#2d2148':'#111d31';ctx.strokeStyle=isPivot?'#a8ecff':isKnown?'#d8b4fe':'#30425e';rect(x,sy,cell-6,cell-6,8);ctx.fillStyle=isPivot?'#061827':'#d8e2ee';ctx.fillText(fmt(matrix[row][c]),x+(cell-6)/2,sy+(cell-6)/2);ctx.fillStyle=isPivot?'#a8ecff':isKnown?'#d8b4fe':'#7f93b0';ctx.fillText(unknown+(c+1),x+(cell-6)/2,sy+cell+9);if(c<n-1){ctx.fillStyle='#6f829d';ctx.fillText('+',x+cell-2,sy+(cell-6)/2);}}const eqX=sx+n*cell+8;ctx.fillStyle='#7f93b0';ctx.fillText('=',eqX,sy+(cell-6)/2);ctx.fillStyle='#48b8e8';ctx.strokeStyle='#a8ecff';rect(eqX+16,sy,cell-6,cell-6,8);ctx.fillStyle='#061827';ctx.fillText(fmt(vector[row]),eqX+16+(cell-6)/2,sy+(cell-6)/2);const knownText=step.knownColumns.length?step.knownColumns.map(c=>fmt(matrix[row][c])+'*'+unknown+(c+1)).join(' + '):'0';const panelY=sy+cell+48;ctx.textAlign='left';ctx.fillStyle='#0b1425';ctx.strokeStyle='#30425e';rect(18,panelY,w-36,88,10);ctx.fillStyle='#d8e2ee';ctx.font='bold 12px Arial';ctx.fillText('Known contribution',34,panelY+24);ctx.font='12px Arial';ctx.fillStyle='#d8b4fe';ctx.fillText(knownText+' = '+fmt(step.knownSum),34,panelY+48);ctx.fillStyle='#d8e2ee';ctx.font='bold 12px Arial';ctx.fillText('Solve the new unknown',34,panelY+76);ctx.font='12px Arial';ctx.fillStyle='#48b8e8';ctx.fillText(step.derivation,176,panelY+76);arrow(Math.max(70,w*0.28),sy+cell+24,Math.max(88,w*0.28),panelY+12,'#d8b4fe');ctx.textAlign='left';ctx.fillStyle='#93a4bd';ctx.font='11px Arial';ctx.fillText('Cyan = pivot/new value. Purple = values already known.',18,h-18);}
window.addEventListener('resize',fit);
window.addEventListener('message',event=>{payload=event.data;fit();});
fit();
<\/script>
</body>
</html>`;
    }

    function drawSubstitutionFrame(card, payload) {
        const frame = card.querySelector(".substitution-frame");
        if (!frame?.contentWindow) return;
        frame.contentWindow.postMessage(payload, "*");
        setTimeout(() => frame.contentWindow?.postMessage(payload, "*"), 80);
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) return String(value);
        const rounded = Math.abs(value) < 1e-12 ? 0 : value;
        return Number(rounded.toPrecision(5)).toString();
    }

    function setupScrollSpy() {
        if (scrollObserver) scrollObserver.disconnect();
        const sections = [...theoryContent.querySelectorAll("section[id]")];
        if (!sections.length) return;

        scrollObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            currentSubtopic = visible.target.id;
            updateBreadcrumb();
            renderNavigation(chapterSearch.value);
        }, {
            root: theoryScroll,
            rootMargin: "-18% 0px -68% 0px",
            threshold: [0.1, 0.25, 0.5]
        });

        sections.forEach(section => scrollObserver.observe(section));
    }

    function scrollToSection(sectionId, smooth = true, addHistory = true) {
        const target = document.getElementById(sectionId);
        if (!target) return;
        if (addHistory) pushRoute({chapterId: currentChapter.id, sectionId, view: 'theory', figureId: null});
        currentSubtopic = sectionId;
        expandDeepDive(sectionId);
        target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
        updateBreadcrumb();
        renderNavigation(chapterSearch.value);
    }

    function updateBreadcrumb() {
        const section = findSection(currentChapter, currentSubtopic);
        const parentSection = findParentSection(currentChapter, section);
        const items = [];

        items.push(`<button data-breadcrumb="chapter">${currentChapter.title}</button>`);
        if (parentSection) {
            items.push(`<button data-breadcrumb="section" data-section-id="${parentSection.id}">${parentSection.title}</button>`);
            items.push(`<button data-breadcrumb="section" data-section-id="${section.id}">${section.title}</button>`);
        } else if (section && section.id !== currentChapter.sections[0]?.id) {
            items.push(`<button data-breadcrumb="section" data-section-id="${section.id}">${section.title}</button>`);
        }

        breadcrumb.innerHTML = items.join(`<span> &gt; </span>`);
        breadcrumb.querySelector("[data-breadcrumb='chapter']")?.addEventListener("click", () => {
            scrollToSection(currentChapter.sections[0]?.id || "start");
        });
        breadcrumb.querySelectorAll("[data-breadcrumb='section']").forEach(button => {
            button.addEventListener("click", () => scrollToSection(button.dataset.sectionId));
        });
    }

    function bindEvents() {
        window.LAG2Back = () => {
            if (figureDialog.open) {closeFigure(); return true;}
            if (history.state?.lag2 && history.state.index > 0) {history.back(); return true;}
            if (isMobile() && mobileView !== 'theory') {updateMobileView('theory', false); return true;}
            return false;
        };
        backButton.addEventListener('click', () => history.back());
        window.addEventListener('popstate', event => restoreRoute(event.state));
        document.getElementById('close-figure').addEventListener('click', closeFigure);
        figureDialog.addEventListener('cancel', event => {event.preventDefault(); closeFigure();});
        figureFrame.addEventListener('load', () => {
            if (activeFigureId === null) return;
            drawDetachedFigure(figureFrame.contentWindow, figureData.get(activeFigureId));
            figureFrame.contentWindow.addEventListener('keydown', event => {if (event.key === 'Escape') closeFigure();});
        });
        chapterSearch.addEventListener("input", () => renderNavigation(chapterSearch.value));

        collapseSidebar.addEventListener("click", () => {
            if (isMobile()) {
                sidebar.classList.remove("mobile-open");
                return;
            }
            sidebar.classList.add("hidden");
            restoreSidebar.classList.remove("hidden");
            syncPaneState();
        });

        restoreSidebar.addEventListener("click", () => {
            if (isMobile()) {
                sidebar.classList.add("mobile-open");
                return;
            }
            sidebar.classList.remove("hidden");
            restoreSidebar.classList.add("hidden");
            syncPaneState();
        });

        hideTheory.addEventListener("click", () => {
            theoryPane.classList.add("hidden");
            resizer.classList.add("hidden");
            restoreTheory.classList.remove("hidden");
            theoryPane.style.width = "";
            syncPaneState();
        });

        restoreTheory.addEventListener("click", () => {
            theoryPane.classList.remove("hidden");
            if (!labPane.classList.contains("hidden")) resizer.classList.remove("hidden");
            restoreTheory.classList.add("hidden");
            syncPaneState();
        });

        hideLab.addEventListener("click", () => {
            labPane.classList.add("hidden");
            resizer.classList.add("hidden");
            restoreLab.classList.remove("hidden");
            syncPaneState();
        });

        restoreLab.addEventListener("click", revealLab);
        window.addEventListener("mousemove", updateRestoreHover);

        runCommandBtn.addEventListener("click", runEditor);
        editorRunBtn.addEventListener("click", runEditor);
        clearConsoleBtn.addEventListener("click", () => {
            clearConsole();
            printToConsole("Command Window cleared.", "system-msg");
        });
        clearWorkspaceBtn.addEventListener("click", () => {
            MatlabEngine.clearWorkspace();
            updateVariables();
            printToConsole("Workspace cleared.", "system-msg");
        });
        resetMatlabBtn.addEventListener("click", resetMatlab);

        toggleVariables.addEventListener("click", () => {
            variablesPanel.classList.toggle("hidden");
            updateVariables();
        });
        closeVariables.addEventListener("click", () => variablesPanel.classList.add("hidden"));

        cmdInput.addEventListener("input", autoSizeEditor);
        cmdInput.addEventListener("keydown", handleEditorKeydown);

        mobileTabs.addEventListener("click", event => {
            const button = event.target.closest("[data-mobile-view]");
            if (!button) return;
            updateMobileView(button.dataset.mobileView);
        });

        window.addEventListener("resize", () => {
            if (!isMobile()) {
                theoryPane.classList.remove("mobile-hidden");
                labPane.classList.remove("mobile-hidden");
                sidebar.classList.remove("mobile-open", "mobile-view");
            }
            syncResponsiveControls();
        });
    }

    function revealLab() {
        labPane.classList.remove("hidden");
        restoreLab.classList.add("hidden");
        if (!theoryPane.classList.contains("hidden") && !isMobile()) resizer.classList.remove("hidden");
        syncPaneState();
    }

    function syncPaneState() {
        workspaceShell.classList.toggle("theory-hidden", theoryPane.classList.contains("hidden"));
        workspaceShell.classList.toggle("lab-hidden", labPane.classList.contains("hidden"));
        appShell.classList.toggle("sidebar-hidden", sidebar.classList.contains("hidden"));

        if (theoryPane.classList.contains("hidden") || labPane.classList.contains("hidden")) {
            resizer.classList.add("hidden");
        } else if (!isMobile()) {
            resizer.classList.remove("hidden");
        }
    }

    function updateRestoreHover(event) {
        const edge = 96;
        const workspaceRect = workspaceShell.getBoundingClientRect();
        const middleBand = Math.abs(event.clientY - workspaceRect.top - workspaceRect.height / 2) < Math.max(170, workspaceRect.height * 0.26);
        const nearWorkspaceLeft = Math.abs(event.clientX - workspaceRect.left) <= edge;
        const nearWorkspaceRight = Math.abs(event.clientX - workspaceRect.right) <= edge;
        restoreSidebar.classList.toggle("hover-reveal", !isMobile() && sidebar.classList.contains("hidden") && event.clientX <= edge);
        restoreTheory.classList.toggle("hover-reveal", !isMobile() && theoryPane.classList.contains("hidden") && middleBand && nearWorkspaceLeft);
        restoreLab.classList.toggle("hover-reveal", !isMobile() && labPane.classList.contains("hidden") && middleBand && nearWorkspaceRight);
    }

    function runEditor() {
        const raw = cmdInput.value.trim();
        if (!raw) return;
        commandHistory.push(raw);
        historyIndex = commandHistory.length;
        executeCommand(raw);
        cmdInput.value = "";
        autoSizeEditor();
    }

    function handleEditorKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            runEditor();
            return;
        }

        if (event.key === "ArrowUp" && commandHistory.length && isEditorAtBoundary("start")) {
            event.preventDefault();
            historyIndex = Math.max(0, historyIndex - 1);
            cmdInput.value = commandHistory[historyIndex] || "";
            autoSizeEditor();
            return;
        }

        if (event.key === "ArrowDown" && commandHistory.length && isEditorAtBoundary("end")) {
            event.preventDefault();
            historyIndex = Math.min(commandHistory.length, historyIndex + 1);
            cmdInput.value = commandHistory[historyIndex] || "";
            autoSizeEditor();
        }
    }

    function isEditorAtBoundary(where) {
        if (where === "start") return cmdInput.selectionStart === 0 && cmdInput.selectionEnd === 0;
        return cmdInput.selectionStart === cmdInput.value.length && cmdInput.selectionEnd === cmdInput.value.length;
    }

    function executeCommand(raw) {
        printToConsole(`>> ${raw}`, "echo");
        const results = MatlabEngine.execute(raw);

        results.forEach(result => {
            if (result.type === "control") {
                if (result.action === "clc") clearConsole();
                if (result.action === "reset") resetMatlab(false);
                if (result.action === "workspace") updateVariables();
                return;
            }
            if (result.type === "figure") {
                openFigureWindow(result.figure);
                if (result.figure.action !== "axis" && result.figure.action !== "label") {
                    printToConsole(`${result.figure.title || "Figure"} opened.`, "system-msg");
                }
                return;
            }
            printToConsole(result.text, result.type);
        });

        updateVariables();
    }

    function openFigureWindow(figure) {
        const figureId = figure.figureId || 1;
        const previous = figureData.get(figureId);
        let nextFigure = figure;

        if (figure.action === "axis") {
            const subplot = figure.subplot || 1;
            const rows = Math.max(previous?.layout?.rows || 1, figure.layout?.rows || 1);
            const cols = Math.max(previous?.layout?.cols || 1, figure.layout?.cols || 1);
            nextFigure = {
                ...(previous || figure),
                ...figure,
                kind: previous?.kind || "plot",
                layout: { rows, cols },
                series: previous?.series || [],
                axes: { ...(previous?.axes || {}), [subplot]: figure.axis }
            };
        } else if (figure.action === "label") {
            const subplot = figure.subplot || 1;
            const rows = Math.max(previous?.layout?.rows || 1, figure.layout?.rows || 1);
            const cols = Math.max(previous?.layout?.cols || 1, figure.layout?.cols || 1);
            nextFigure = {
                ...(previous || figure),
                ...figure,
                kind: previous?.kind || "plot",
                layout: { rows, cols },
                series: previous?.series || [],
                axes: previous?.axes || {},
                labels: {
                    ...(previous?.labels || {}),
                    [subplot]: {
                        ...(previous?.labels?.[subplot] || {}),
                        ...(figure.label || {})
                    }
                }
            };
        } else if (figure.kind === "plot") {
            const previousSeries = previous?.kind === "plot" ? previous.series || [] : [];
            const subplot = figure.subplot || 1;
            const rows = Math.max(previous?.layout?.rows || 1, figure.layout?.rows || 1);
            const cols = Math.max(previous?.layout?.cols || 1, figure.layout?.cols || 1);
            nextFigure = {
                ...figure,
                layout: { rows, cols },
                axes: previous?.axes || {},
                labels: previous?.labels || {},
                series: figure.append
                    ? [...previousSeries, ...(figure.series || [])]
                    : [...previousSeries.filter(item => (item.subplot || 1) !== subplot), ...(figure.series || [])]
            };
        }

        figureData.set(figureId, nextFigure);

        showFigure(figureId);
    }

    function showFigure(figureId, addHistory = true) {
        const figure = figureData.get(figureId);
        if (!figure) return;
        if (addHistory) {
            if (!figureDialog.open) pushRoute({figureId, scrollTop: theoryScroll.scrollTop});
            else history.replaceState({...history.state, figureId}, '', location.href);
        }
        activeFigureId = figureId;
        figureTitle.textContent = figure.title || 'Figure';
        if (!figureDialog.open) figureDialog.showModal();
        figureFrame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:white}canvas{display:block;width:100%;height:100%}</style></head><body><canvas id="figure-canvas"></canvas></body></html>';
        document.getElementById('close-figure').focus();
    }

    function hideFigure() {
        activeFigureId = null;
        if (figureDialog.open) figureDialog.close();
    }

    function closeFigure() {
        hideFigure();
        if (history.state?.figureId) history.back();
    }

    function drawDetachedFigure(figureWindow, figure) {
        if (!figureWindow || figureWindow.closed) return;
        const canvas = figureWindow.document.getElementById("figure-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = figureWindow.devicePixelRatio || 1;
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw();
        };

        const finiteExtent = values => {
            const finite = values.filter(Number.isFinite);
            let min = Math.min(...finite);
            let max = Math.max(...finite);
            if (!Number.isFinite(min) || !Number.isFinite(max)) {
                min = 0;
                max = 1;
            }
            if (min === max) {
                min -= 1;
                max += 1;
            }
            return { min, max };
        };

        const tickValues = (extent, count) => Array.from({ length: count }, (_, index) => extent.min + (index / (count - 1)) * (extent.max - extent.min));
        const formatTick = value => Number.isFinite(value) ? Number(value.toPrecision(4)).toString() : "";
        const colorMap = value => {
            const t = Math.max(0, Math.min(1, value));
            const r = Math.round(35 + t * 220);
            const g = Math.round(90 + Math.sin(t * Math.PI) * 120);
            const b = Math.round(210 - t * 160);
            return `rgb(${r},${g},${b})`;
        };

        const drawMarker = (x, y, marker) => {
            ctx.beginPath();
            if (marker === "o") {
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.stroke();
            } else if (marker === "." || marker === "*") {
                ctx.arc(x, y, marker === "." ? 2.5 : 4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(x - 4, y - 4);
                ctx.lineTo(x + 4, y + 4);
                ctx.moveTo(x + 4, y - 4);
                ctx.lineTo(x - 4, y + 4);
                ctx.stroke();
            }
        };

        const drawPlot = (width, height) => {
            const series = figure.series || [];
            const layout = figure.layout || { rows: 1, cols: 1 };
            const rows = Math.max(1, layout.rows || 1);
            const cols = Math.max(1, layout.cols || 1);
            const gap = 28;
            const panelWidth = (width - gap * (cols - 1)) / cols;
            const panelHeight = (height - gap * (rows - 1)) / rows;

            for (let index = 1; index <= rows * cols; index++) {
                const col = (index - 1) % cols;
                const row = Math.floor((index - 1) / cols);
                const panelSeries = series.filter(item => (item.subplot || 1) === index);
                if (panelSeries.length) {
                    drawSinglePlot(col * (panelWidth + gap), row * (panelHeight + gap), panelWidth, panelHeight, panelSeries, figure.axes?.[index], figure.labels?.[index]);
                }
            }
        };

        const drawSinglePlot = (originX, originY, width, height, series, axisOverride, labels = {}) => {
            const margin = { left: 50, right: 18, top: labels.title ? 42 : 26, bottom: labels.xlabel ? 54 : 38 };
            const allX = series.flatMap(item => item.x || []);
            const allY = series.flatMap(item => item.y || []);
            const xExt = axisOverride?.x ? { min: axisOverride.x[0], max: axisOverride.x[1] } : finiteExtent(allX);
            const yExt = axisOverride?.y ? { min: axisOverride.y[0], max: axisOverride.y[1] } : finiteExtent(allY);
            const xTicks = tickValues(xExt, 5);
            const yTicks = tickValues(yExt, 5);
            const plotWidth = Math.max(1, width - margin.left - margin.right);
            const plotHeight = Math.max(1, height - margin.top - margin.bottom);
            const sx = value => originX + margin.left + ((value - xExt.min) / (xExt.max - xExt.min)) * plotWidth;
            const sy = value => originY + margin.top + plotHeight - ((value - yExt.min) / (yExt.max - yExt.min)) * plotHeight;

            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const gx = originX + margin.left + (i / 5) * plotWidth;
                const gy = originY + margin.top + (i / 5) * plotHeight;
                ctx.beginPath();
                ctx.moveTo(gx, originY + margin.top);
                ctx.lineTo(gx, originY + margin.top + plotHeight);
                ctx.moveTo(originX + margin.left, gy);
                ctx.lineTo(originX + margin.left + plotWidth, gy);
                ctx.stroke();
            }

            ctx.strokeStyle = "#111827";
            ctx.beginPath();
            ctx.rect(originX + margin.left, originY + margin.top, plotWidth, plotHeight);
            ctx.stroke();

            series.forEach(item => {
                const x = item.x || [];
                const y = item.y || [];
                const style = item.style || {};
                ctx.strokeStyle = style.color || "#2563eb";
                ctx.fillStyle = style.color || "#2563eb";
                ctx.lineWidth = 2;
                ctx.setLineDash(style.lineDash || []);
                ctx.beginPath();
                x.forEach((value, index) => {
                    const px = sx(value);
                    const py = sy(y[index]);
                    if (index === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                });
                ctx.stroke();
                ctx.setLineDash([]);
                if (style.marker) x.forEach((value, index) => drawMarker(sx(value), sy(y[index]), style.marker));
            });

            ctx.fillStyle = "#111827";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            xTicks.forEach(value => ctx.fillText(formatTick(value), sx(value), originY + height - 14));
            ctx.textAlign = "right";
            yTicks.forEach(value => ctx.fillText(formatTick(value), originX + margin.left - 8, sy(value) + 4));
            if (labels.title) {
                ctx.font = "bold 13px Arial";
                ctx.textAlign = "center";
                ctx.fillText(labels.title, originX + margin.left + plotWidth / 2, originY + 16);
            }
            if (labels.xlabel) {
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.fillText(labels.xlabel, originX + margin.left + plotWidth / 2, originY + height - 6);
            }
            if (labels.ylabel) {
                ctx.save();
                ctx.translate(originX + 12, originY + margin.top + plotHeight / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = "center";
                ctx.fillText(labels.ylabel, 0, 0);
                ctx.restore();
            }
            ctx.textAlign = "start";
        };

        const drawSurface = (width, height) => {
            const z = figure.z || [];
            const rows = z.length;
            const cols = z[0]?.length || 0;
            if (rows < 2 || cols < 2) return;
            const zExt = finiteExtent(z.flat());
            const scale = Math.min(width / Math.max(cols + rows, 2), height / Math.max(cols + rows, 2)) * 1.12;
            const zScale = height * 0.32 / (zExt.max - zExt.min);
            const cx = width * 0.5;
            const cy = height * 0.22;
            const project = (row, col, value) => ({
                x: cx + (col - row) * scale,
                y: cy + (col + row) * scale * 0.48 - (value - zExt.min) * zScale
            });

            for (let row = rows - 2; row >= 0; row--) {
                for (let col = 0; col < cols - 1; col++) {
                    const p1 = project(row, col, z[row][col]);
                    const p2 = project(row, col + 1, z[row][col + 1]);
                    const p3 = project(row + 1, col + 1, z[row + 1][col + 1]);
                    const p4 = project(row + 1, col, z[row + 1][col]);
                    const avg = (z[row][col] + z[row][col + 1] + z[row + 1][col + 1] + z[row + 1][col]) / 4;
                    ctx.fillStyle = colorMap((avg - zExt.min) / (zExt.max - zExt.min));
                    ctx.strokeStyle = "rgba(17, 24, 39, 0.32)";
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        };

        const draw = () => {
            const width = canvas.clientWidth || canvas.width;
            const height = canvas.clientHeight || canvas.height;
            ctx.clearRect(0, 0, width, height);
            if (figure.kind === "empty") {
                ctx.fillStyle = "#6b7280";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Empty figure", width / 2, height / 2);
                ctx.textAlign = "start";
            } else if (figure.kind === "surf") {
                drawSurface(width, height);
            } else {
                drawPlot(width, height);
            }
        };

        figureWindow.onresize = resize;
        resize();
    }

    function printToConsole(text, className) {
        if (!text) return;
        const div = document.createElement("div");
        div.className = className;
        div.textContent = text;
        consoleOutput.appendChild(div);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function clearConsole() {
        consoleOutput.innerHTML = "";
    }

    function resetMatlab(printMessage = true) {
        MatlabEngine.reset();
        if (figureDialog.open) closeFigure();
        figureData.clear();
        clearConsole();
        updateVariables();
        if (printMessage) printToConsole("MATLAB-Lite opened. Workspace and Command Window are fresh.", "system-msg");
        else printToConsole("MATLAB-Lite opened.", "system-msg");
    }

    function updateVariables() {
        const variables = MatlabEngine.getWorkspace();
        if (!variables.length) {
            variablesTable.innerHTML = `<div class="empty-state">No variables yet.</div>`;
            return;
        }
        variablesTable.innerHTML = variables.map(variable => `
            <div class="variable-row">
                <strong>${escapeHtml(variable.name)}</strong>
                <span>${escapeHtml(variable.size)}</span>
                <small>${escapeHtml(variable.className)}</small>
                <div class="variable-value">${escapeHtml(variable.preview)}</div>
            </div>
        `).join("");
    }

    function autoSizeEditor() {
        cmdInput.style.height = "auto";
        cmdInput.style.height = `${Math.min(cmdInput.scrollHeight, 210)}px`;
    }

    function setupResizer() {
        let startX = 0;
        let startWidth = 0;

        resizer.addEventListener("mousedown", event => {
            if (isMobile()) return;
            startX = event.clientX;
            startWidth = theoryPane.getBoundingClientRect().width;
            appShell.classList.add("resizing");
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        function onMouseMove(event) {
            const workspaceWidth = document.querySelector(".workspace").getBoundingClientRect().width;
            const nextWidth = startWidth + event.clientX - startX;
            const minTheory = 380;
            const minLab = 430;

            if (nextWidth < 260) {
                theoryPane.classList.add("hidden");
                resizer.classList.add("hidden");
                restoreTheory.classList.remove("hidden");
                theoryPane.style.width = "";
                syncPaneState();
                onMouseUp();
                return;
            }

            if (workspaceWidth - nextWidth < 320) {
                labPane.classList.add("hidden");
                resizer.classList.add("hidden");
                restoreLab.classList.remove("hidden");
                syncPaneState();
                onMouseUp();
                return;
            }

            const clamped = Math.max(minTheory, Math.min(nextWidth, workspaceWidth - minLab));
            theoryPane.style.width = `${clamped}px`;
        }

        function onMouseUp() {
            appShell.classList.remove("resizing");
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }

    function updateMobileView(view, addHistory = true) {
        mobileView = view;
        if (!isMobile()) return;
        if (addHistory) pushRoute({view, figureId: null, scrollTop: theoryScroll.scrollTop});
        theoryPane.classList.toggle("mobile-hidden", view !== "theory");
        labPane.classList.toggle("mobile-hidden", view !== "lab");
        sidebar.classList.toggle("mobile-open", view === "nav");
        sidebar.classList.toggle("mobile-view", view === "nav");
        mobileTabs.querySelectorAll(".mobile-tab").forEach(tab => {
            tab.classList.toggle("active", tab.dataset.mobileView === view);
        });
    }

    function closeMobileNavigation() {
        if (!isMobile()) return;
        sidebar.classList.remove("mobile-open", "mobile-view");
        updateMobileView("theory", false);
    }

    function syncResponsiveControls() {
        if (isMobile()) {
            updateMobileView(mobileView, false);
            sidebar.classList.remove("hidden");
            restoreSidebar.classList.remove("hidden");
            variablesPanel.classList.add("hidden");
            syncPaneState();
            return;
        }

        if (!sidebar.classList.contains("hidden")) {
            restoreSidebar.classList.add("hidden");
        }
        syncPaneState();
    }

    function isMobile() {
        return window.matchMedia("(max-width: 1024px)").matches;
    }

    function typesetMath() {
        if (window.MathJax?.typesetPromise) MathJax.typesetPromise([theoryContent]);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    document.addEventListener("math-ready", typesetMath);
    init();
});
