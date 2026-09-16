'use client';

import React from 'react';

/* ==========================================================================
   The demo script.

   Each chapter renders a mock of the real product at a given point in the
   workflow. `t` is progress through that chapter, 0 to 1, so scenes animate
   themselves off a single clock owned by the player.
   ========================================================================== */

export interface Waypoint {
	/** When the pointer arrives, as a fraction of the chapter. */
	at: number;
	/** Position inside the viewport, in percent. */
	x: number;
	y: number;
	click?: boolean;
}

export interface Chapter {
	id: string;
	label: string;
	caption: string;
	url: string;
	duration: number;
	cursor: Waypoint[];
	render: (t: number) => React.ReactNode;
}

/* Helpers ---------------------------------------------------------------- */

/** True once the chapter passes `mark`. */
const at = (t: number, mark: number) => t >= mark;

/** Reveals `text` one character at a time between `from` and `to`. */
function typed(text: string, t: number, from: number, to: number) {
	if (t <= from) return '';
	if (t >= to) return text;
	const chars = Math.round(((t - from) / (to - from)) * text.length);
	return text.slice(0, chars);
}

/** Eases a number from 0 to `target` between `from` and `to`. */
function ramp(target: number, t: number, from: number, to: number) {
	if (t <= from) return 0;
	if (t >= to) return target;
	const p = (t - from) / (to - from);
	return Math.round(target * (1 - Math.pow(1 - p, 3)));
}

function Caret({ on }: { on: boolean }) {
	return on ? <i className="o-mock__caret" /> : null;
}

function MockApp({
	crumb,
	role = 'Instructor',
	who = 'S. Badrinarayan',
	children,
}: {
	crumb: string;
	role?: string;
	who?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="o-mock">
			<div className="o-mock__bar">
				<span className="o-mockGlyph" aria-hidden="true" />
				<span className="o-mock__crumb">{crumb}</span>
				<span className="o-mock__spacer" />
				<span className="o-mock__role">{role}</span>
				<span className="o-mock__avatar" aria-hidden="true">
					{who
						.split(' ')
						.map((part) => part[0])
						.join('')}
				</span>
			</div>
			<div className="o-mock__body">{children}</div>
		</div>
	);
}

function Field({
	label,
	value,
	caret,
	wide,
}: {
	label: string;
	value: React.ReactNode;
	caret?: boolean;
	wide?: boolean;
}) {
	return (
		<label className={`o-mock__field ${wide ? 'o-mock__field--wide' : ''}`}>
			<span className="o-mock__label">{label}</span>
			<span className="o-mock__input">
				{value}
				<Caret on={Boolean(caret)} />
			</span>
		</label>
	);
}

/* 01 — Teacher dashboard ------------------------------------------------- */

const COURSES = [
	{ code: 'ACCY 202', name: 'Managerial Accounting', students: 41 },
	{ code: 'FIN 221', name: 'Corporate Finance', students: 88 },
	{ code: 'FIN 300', name: 'Investments', students: 26 },
];

function SceneDashboard(t: number) {
	return (
		<MockApp crumb="Courses">
			<div className="o-mock__head">
				<h4>Your courses</h4>
				<span className="o-mock__meta">3 active · 155 students</span>
			</div>
			<div className="o-mock__grid o-mock__grid--4">
				{COURSES.map((course) => (
					<div key={course.code} className="o-mock__card">
						<span className="o-mock__cardCode">{course.code}</span>
						<span className="o-mock__cardName">{course.name}</span>
						<span className="o-mock__cardMeta">{course.students} students</span>
					</div>
				))}
				<div className={`o-mock__card o-mock__card--new ${at(t, 0.7) ? 'is-hot' : ''}`}>
					<span className="o-mock__plus">+</span>
					<span className="o-mock__cardName">New course</span>
				</div>
			</div>
		</MockApp>
	);
}

/* 02 — Create the course ------------------------------------------------ */

function SceneCreate(t: number) {
	const name = typed('ACCY 201 — Financial Accounting', t, 0.08, 0.5);
	const code = at(t, 0.62);

	return (
		<MockApp crumb="Courses / New">
			<div className="o-mock__head">
				<h4>Create a course</h4>
				<span className="o-mock__meta">Step 1 of 2</span>
			</div>
			<div className="o-mock__form">
				<Field label="Course name" value={name} caret={t > 0.08 && t < 0.56} wide />
				<Field label="Term" value={at(t, 0.55) ? 'Fall 2026' : ''} />
				<Field label="Section" value={at(t, 0.58) ? 'A1' : ''} />
			</div>

			<div className={`o-mock__notice ${code ? 'is-in' : ''}`}>
				<span className="o-mock__label">Join code generated</span>
				<span className="o-mock__code">ORCH-4K2P</span>
				<span className="o-mock__meta">Students enrol with this code</span>
			</div>

			<div className="o-mock__actions">
				<span className="o-mock__btn o-mock__btn--ghost">Cancel</span>
				<span className={`o-mock__btn ${at(t, 0.82) ? 'is-hot' : ''}`}>Create course</span>
			</div>
		</MockApp>
	);
}

/* 03 — Upload and embed materials --------------------------------------- */

const FILES = [
	{ name: 'Syllabus — ACCY 201.pdf', size: '412 KB', start: 0.1 },
	{ name: 'Lecture 09 — WACC.pdf', size: '1.8 MB', start: 0.24 },
	{ name: 'Problem Set 3.docx', size: '96 KB', start: 0.38 },
];

const STATUS = ['Uploading', 'Parsing', 'Embedding', 'Indexed'];

function SceneUpload(t: number) {
	const chunks = ramp(412, t, 0.35, 0.92);

	return (
		<MockApp crumb="ACCY 201 / Materials">
			<div className="o-mock__head">
				<h4>Course materials</h4>
				<span className="o-mock__meta">Drop files to index</span>
			</div>

			<div className="o-mock__split">
				<div className="o-mock__files">
					<div className={`o-mock__drop ${t < 0.1 ? 'is-hot' : ''}`}>
						Drag PDF, DOCX, TXT or MD here
					</div>

					{FILES.map((file) => {
						const local = (t - file.start) / 0.42;
						if (local < 0) return null;
						const stage = Math.min(Math.floor(local * 4), 3);
						const pct = Math.min(Math.round(local * 100), 100);
						return (
							<div key={file.name} className="o-mock__file is-in">
								<span className="o-mock__fileName">{file.name}</span>
								<span className="o-mock__fileSize">{file.size}</span>
								<span className="o-mock__track">
									<span className="o-mock__fill" style={{ width: `${pct}%` }} />
								</span>
								<span
									className={`o-mock__stage ${stage === 3 ? 'is-done' : ''}`}
								>
									{STATUS[stage]}
								</span>
							</div>
						);
					})}
				</div>

				<div className="o-mock__panel">
					<span className="o-mock__label">Vector collection</span>
					<span className="o-mock__collection">qdrant · accy201</span>
					<span className="o-mock__bigNumber">{chunks}</span>
					<span className="o-mock__meta">passages indexed</span>
					<div className="o-mock__specks" aria-hidden="true">
						{Array.from({ length: 24 }).map((_, i) => (
							<span
								key={i}
								className={`o-mock__speck ${chunks / 412 > i / 24 ? 'is-on' : ''}`}
							/>
						))}
					</div>
					<span className="o-mock__meta">Scoped to this course only</span>
				</div>
			</div>
		</MockApp>
	);
}

/* 04 — Generate from retrieved context --------------------------------- */

const RETRIEVED = [
	{ source: 'Lecture 09 — WACC.pdf · p.4', score: '0.94' },
	{ source: 'Lecture 09 — WACC.pdf · p.7', score: '0.91' },
	{ source: 'Syllabus — ACCY 201.pdf · p.2', score: '0.86' },
	{ source: 'Problem Set 3.docx · Q4', score: '0.82' },
];

const GENERATED = [
	'A firm’s target capital structure is 40% debt and 60% equity…',
	'Using the after-tax cost of debt, which weight set applies…',
	'Given a 21% marginal tax rate and a 6% coupon on par debt…',
];

function SceneGenerate(t: number) {
	const topic = typed('Weighted average cost of capital', t, 0.06, 0.34);
	const generating = at(t, 0.5);
	const written = at(t, 0.6) ? ramp(8, t, 0.6, 0.95) : 0;

	return (
		<MockApp crumb="ACCY 201 / Quizzes / New">
			<div className="o-mock__head">
				<h4>Generate a quiz</h4>
				<span className="o-mock__meta">Grounded in course materials</span>
			</div>

			<div className="o-mock__form o-mock__form--lead">
				<Field label="Topic" value={topic} caret={t > 0.06 && t < 0.4} />
				<Field label="Questions" value={at(t, 0.38) ? '8' : ''} />
				<Field label="Type" value={at(t, 0.41) ? 'Multiple choice' : ''} />
			</div>

			<div className="o-mock__toggleRow">
				<span className={`o-mock__toggle ${at(t, 0.44) ? 'is-on' : ''}`} aria-hidden="true">
					<i />
				</span>
				<span className="o-mock__label">Use retrieved course context</span>
				<span className="o-mock__spacer" />
				<span className={`o-mock__btn ${at(t, 0.47) && !generating ? 'is-hot' : ''}`}>
					{generating ? 'Generating…' : 'Generate'}
				</span>
			</div>

			<div className="o-mock__split">
				<div className="o-mock__panel o-mock__panel--flush">
					<span className="o-mock__label">Retrieved context</span>
					{RETRIEVED.map((row, i) => (
						<div
							key={row.source}
							className={`o-mock__chunk ${at(t, 0.52 + i * 0.035) ? 'is-in' : ''}`}
						>
							<span className="o-mock__chunkSource">{row.source}</span>
							<span className="o-mock__chunkScore">{row.score}</span>
						</div>
					))}
				</div>

				<div className="o-mock__panel o-mock__panel--flush">
					<span className="o-mock__label">
						Written {written} of 8
						<span className="o-mock__track o-mock__track--thin">
							<span className="o-mock__fill" style={{ width: `${(written / 8) * 100}%` }} />
						</span>
					</span>
					{GENERATED.map((question, i) => (
						<div
							key={question}
							className={`o-mock__question ${at(t, 0.64 + i * 0.08) ? 'is-in' : ''}`}
						>
							<span className="o-mock__qIndex">{String(i + 1).padStart(2, '0')}</span>
							<span className="o-mock__qText">{question}</span>
						</div>
					))}
				</div>
			</div>
		</MockApp>
	);
}

/* 05 — Review and publish ---------------------------------------------- */

const OPTIONS = [
	{ letter: 'A', text: 'Book weights, pre-tax cost of debt' },
	{ letter: 'B', text: 'Target weights, after-tax cost of debt', correct: true },
	{ letter: 'C', text: 'Book weights, after-tax cost of debt' },
	{ letter: 'D', text: 'Target weights, pre-tax cost of debt' },
];

function SceneReview(t: number) {
	const points = typed('10', t, 0.34, 0.46);
	const published = at(t, 0.82);

	return (
		<MockApp crumb="ACCY 201 / Quizzes / WACC Practice">
			<div className="o-mock__head">
				<h4>Review before publishing</h4>
				<span className="o-mock__meta">8 questions · draft</span>
			</div>

			<div className="o-mock__question o-mock__question--full is-in">
				<span className="o-mock__qIndex">01</span>
				<div>
					<p className="o-mock__qText">
						Which combination should be used when computing WACC for this firm?
					</p>
					<div className="o-mock__options">
						{OPTIONS.map((option) => (
							<span
								key={option.letter}
								className={`o-mock__option ${
									option.correct && at(t, 0.2) ? 'is-correct' : ''
								}`}
							>
								<i>{option.letter}</i>
								{option.text}
								{option.correct && at(t, 0.2) && (
									<em className="o-mock__key">Answer key</em>
								)}
							</span>
						))}
					</div>
					<p className="o-mock__trace">
						Traced to Lecture 09 — WACC.pdf · p.4
					</p>
				</div>
			</div>

			<div className="o-mock__form">
				<Field label="Points" value={points} caret={t > 0.34 && t < 0.5} />
				<Field label="Due" value={at(t, 0.56) ? '14 Oct, 11:59 pm' : ''} />
				<Field label="Time limit" value={at(t, 0.66) ? '30 minutes' : ''} />
			</div>

			<div className="o-mock__actions">
				<span className="o-mock__btn o-mock__btn--ghost">Save draft</span>
				<span className={`o-mock__btn ${at(t, 0.74) && !published ? 'is-hot' : ''}`}>
					Publish
				</span>
			</div>

			<div className={`o-mock__toast ${published ? 'is-in' : ''}`}>
				Published to 34 enrolled students
			</div>
		</MockApp>
	);
}

/* 06 — The student joins ---------------------------------------------- */

function SceneJoin(t: number) {
	const code = typed('ORCH-4K2P', t, 0.1, 0.42);
	const joined = at(t, 0.52);

	return (
		<MockApp crumb="My courses" role="Student" who="A. Whitfield">
			<div className="o-mock__head">
				<h4>Join a course</h4>
				<span className="o-mock__meta">Enter the code from your instructor</span>
			</div>

			<div className="o-mock__form">
				<Field label="Join code" value={code} caret={t > 0.1 && t < 0.48} wide />
			</div>

			<div className="o-mock__actions o-mock__actions--start">
				<span className={`o-mock__btn ${at(t, 0.45) && !joined ? 'is-hot' : ''}`}>Join</span>
			</div>

			<div className={`o-mock__notice ${joined ? 'is-in' : ''}`}>
				<span className="o-mock__label">Enrolled</span>
				<span className="o-mock__code">ACCY 201 — Financial Accounting</span>
			</div>

			<div className={`o-mock__assignments ${at(t, 0.66) ? 'is-in' : ''}`}>
				<div className="o-mock__assignment">
					<span className="o-mock__assignmentName">WACC Practice</span>
					<span className="o-mock__meta">8 questions · 30 min · due 14 Oct</span>
					<span className={`o-mock__btn ${at(t, 0.84) ? 'is-hot' : ''}`}>Start</span>
				</div>
			</div>
		</MockApp>
	);
}

/* 07 — Taking the quiz ------------------------------------------------ */

function SceneTake(t: number) {
	const seconds = 1798 - Math.floor(t * 120);
	const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
		seconds % 60
	).padStart(2, '0')}`;
	const answered = ramp(6, t, 0.12, 0.82);
	const picked = at(t, 0.34);

	return (
		<MockApp crumb="ACCY 201 / WACC Practice" role="Student" who="A. Whitfield">
			<div className="o-mock__head">
				<h4>Question 1 of 8</h4>
				<span className="o-mock__clock">{clock} remaining</span>
			</div>

			<div className="o-mock__dots" aria-hidden="true">
				{Array.from({ length: 8 }).map((_, i) => (
					<span key={i} className={`o-mock__dot ${i < answered ? 'is-on' : ''}`} />
				))}
			</div>

			<div className="o-mock__question o-mock__question--full o-mock__question--tall is-in">
				<span className="o-mock__qIndex">01</span>
				<div>
					<p className="o-mock__qText">
						Which combination should be used when computing WACC for this firm?
					</p>
					<div className="o-mock__options">
						{OPTIONS.map((option) => (
							<span
								key={option.letter}
								className={`o-mock__option ${
									option.correct && picked ? 'is-picked' : ''
								}`}
							>
								<i>{option.letter}</i>
								{option.text}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="o-mock__actions">
				<span className="o-mock__btn o-mock__btn--ghost">Previous</span>
				<span className={`o-mock__btn ${at(t, 0.86) ? 'is-hot' : ''}`}>Submit quiz</span>
			</div>
		</MockApp>
	);
}

/* 08 — Instant grading ------------------------------------------------ */

const FEEDBACK = [
	{ q: '01', ok: true, note: 'Target weights, after-tax cost of debt' },
	{ q: '02', ok: true, note: 'Correct — CAPM applied to levered beta' },
	{ q: '03', ok: false, note: 'Used the pre-tax cost of debt. Lecture 09, p.4 specifies after-tax throughout.' },
	{ q: '04', ok: true, note: 'Correct — terminal value discounted one period' },
];

function SceneResults(t: number) {
	const score = ramp(88, t, 0.12, 0.6);

	return (
		<MockApp crumb="ACCY 201 / WACC Practice / Result" role="Student" who="A. Whitfield">
			<div className="o-mock__head">
				<h4>Submitted</h4>
				<span className="o-mock__meta">Graded instantly</span>
			</div>

			<div className="o-mock__score">
				<div
					className="o-mock__ring"
					style={{ '--p': `${score}%` } as React.CSSProperties}
					aria-hidden="true"
				>
					<span>{score}%</span>
				</div>
				<div>
					<span className="o-mock__label">7 of 8 correct</span>
					<p className="o-mock__meta">
						Feedback is available immediately, with the source passage for anything missed.
					</p>
				</div>
			</div>

			<div className="o-mock__feedback">
				{FEEDBACK.map((row, i) => (
					<div
						key={row.q}
						className={`o-mock__fbRow ${at(t, 0.5 + i * 0.09) ? 'is-in' : ''} ${
							row.ok ? '' : 'is-wrong'
						}`}
					>
						<span className="o-mock__qIndex">{row.q}</span>
						<span className="o-mock__fbMark">{row.ok ? '✓' : '✕'}</span>
						<span className="o-mock__fbNote">{row.note}</span>
					</div>
				))}
			</div>
		</MockApp>
	);
}

/* 09 — What the instructor sees --------------------------------------- */

const CONCEPTS = [
	{ name: 'CAPM & cost of equity', mastery: 84 },
	{ name: 'Terminal value', mastery: 71 },
	{ name: 'After-tax cost of debt', mastery: 62 },
	{ name: 'Target vs book weights', mastery: 48, flag: true },
];

function SceneAnalytics(t: number) {
	return (
		<MockApp crumb="ACCY 201 / WACC Practice / Submissions">
			<div className="o-mock__head">
				<h4>Cohort performance</h4>
				<span className="o-mock__meta">
					{ramp(34, t, 0.05, 0.4)} of 34 submitted · average {ramp(78, t, 0.05, 0.45)}%
				</span>
			</div>

			<span className="o-mock__label">Mastery by concept</span>
			<div className="o-mock__concepts">
				{CONCEPTS.map((concept, i) => (
					<div
						key={concept.name}
						className={`o-mock__concept ${at(t, 0.28 + i * 0.08) ? 'is-in' : ''} ${
							concept.flag ? 'is-flagged' : ''
						}`}
					>
						<span className="o-mock__conceptName">{concept.name}</span>
						<span className="o-mock__track">
							<span
								className="o-mock__fill"
								style={{
									width: at(t, 0.3 + i * 0.08) ? `${concept.mastery}%` : '0%',
								}}
							/>
						</span>
						<span className="o-mock__conceptValue">{concept.mastery}%</span>
					</div>
				))}
			</div>

			<div className={`o-mock__callout ${at(t, 0.72) ? 'is-in' : ''}`}>
				<span className="o-mock__label">Flagged for review</span>
				<p className="o-mock__meta">
					Target versus book weights sits at 48% mastery across the section — surfaced
					eleven days before the midterm.
				</p>
			</div>
		</MockApp>
	);
}

/* Script ---------------------------------------------------------------- */

export const CHAPTERS: Chapter[] = [
	{
		id: 'dashboard',
		label: 'The instructor’s courses',
		caption:
			'Everything starts from the courses an instructor already teaches. No new system to learn, no parallel gradebook to maintain.',
		url: 'orchardedu.com/dashboard/teacher',
		duration: 5200,
		cursor: [
			{ at: 0, x: 24, y: 30 },
			{ at: 0.55, x: 84, y: 58 },
			{ at: 0.78, x: 84, y: 58, click: true },
		],
		render: SceneDashboard,
	},
	{
		id: 'create',
		label: 'Create the course',
		caption:
			'A course is named once and gets a join code. In production this is where the Canvas connection is authorised instead, and the roster arrives on its own.',
		url: 'orchardedu.com/dashboard/teacher/courses/create',
		duration: 6800,
		cursor: [
			{ at: 0, x: 30, y: 26 },
			{ at: 0.6, x: 30, y: 40 },
			{ at: 0.8, x: 86, y: 88 },
			{ at: 0.88, x: 86, y: 88, click: true },
		],
		render: SceneCreate,
	},
	{
		id: 'materials',
		label: 'Index the materials',
		caption:
			'Syllabi, lecture notes and problem sets are parsed, split into passages, embedded, and written to a Qdrant collection scoped to this course alone.',
		url: 'orchardedu.com/dashboard/teacher/courses/accy201/materials',
		duration: 7600,
		cursor: [
			{ at: 0, x: 26, y: 24 },
			{ at: 0.12, x: 26, y: 24, click: true },
			{ at: 0.5, x: 74, y: 52 },
		],
		render: SceneUpload,
	},
	{
		id: 'generate',
		label: 'Generate from context',
		caption:
			'Retrieval runs first and the model only sees what came back. The scores beside each passage are the similarity that earned it a place in the context window.',
		url: 'orchardedu.com/dashboard/teacher/courses/accy201/quizzes/create',
		duration: 8400,
		cursor: [
			{ at: 0, x: 30, y: 27 },
			{ at: 0.42, x: 30, y: 40 },
			{ at: 0.47, x: 88, y: 46 },
			{ at: 0.5, x: 88, y: 46, click: true },
			{ at: 0.7, x: 74, y: 72 },
		],
		render: SceneGenerate,
	},
	{
		id: 'review',
		label: 'Review and publish',
		caption:
			'Every question arrives with its answer key and a trace back to the passage it came from, so the instructor is approving something they can verify.',
		url: 'orchardedu.com/dashboard/teacher/courses/accy201/quizzes/12/edit',
		duration: 8000,
		cursor: [
			{ at: 0, x: 40, y: 34 },
			{ at: 0.32, x: 22, y: 68 },
			{ at: 0.36, x: 22, y: 68, click: true },
			{ at: 0.72, x: 86, y: 88 },
			{ at: 0.79, x: 86, y: 88, click: true },
		],
		render: SceneReview,
	},
	{
		id: 'join',
		label: 'The student enrols',
		caption:
			'On the student side the quiz simply appears, with its due date and time limit already set.',
		url: 'orchardedu.com/dashboard/student',
		duration: 6400,
		cursor: [
			{ at: 0, x: 30, y: 30 },
			{ at: 0.44, x: 18, y: 48 },
			{ at: 0.48, x: 18, y: 48, click: true },
			{ at: 0.82, x: 84, y: 80 },
			{ at: 0.9, x: 84, y: 80, click: true },
		],
		render: SceneJoin,
	},
	{
		id: 'take',
		label: 'Taking the quiz',
		caption:
			'Answers are tracked as the student works, and the timer enforces the limit the instructor set. Nothing here needs the instructor present.',
		url: 'orchardedu.com/dashboard/student/courses/accy201/quizzes/12',
		duration: 7200,
		cursor: [
			{ at: 0, x: 34, y: 46 },
			{ at: 0.3, x: 34, y: 55 },
			{ at: 0.36, x: 34, y: 55, click: true },
			{ at: 0.84, x: 86, y: 90 },
			{ at: 0.9, x: 86, y: 90, click: true },
		],
		render: SceneTake,
	},
	{
		id: 'results',
		label: 'Graded on submission',
		caption:
			'The score is immediate, and anything missed comes back with the reason and the source passage rather than just a cross.',
		url: 'orchardedu.com/dashboard/student/courses/accy201/quizzes/12',
		duration: 6800,
		cursor: [
			{ at: 0, x: 30, y: 40 },
			{ at: 0.55, x: 60, y: 70 },
		],
		render: SceneResults,
	},
	{
		id: 'analytics',
		label: 'Concept-level analytics',
		caption:
			'This is the part legacy platforms cannot do. Not who logged in, but which idea the cohort has not understood — early enough to act on it.',
		url: 'orchardedu.com/dashboard/teacher/courses/accy201/quizzes/12/submissions',
		duration: 8000,
		cursor: [
			{ at: 0, x: 28, y: 26 },
			{ at: 0.4, x: 62, y: 58 },
			{ at: 0.75, x: 46, y: 84 },
		],
		render: SceneAnalytics,
	},
];

export const TOTAL = CHAPTERS.reduce((sum, chapter) => sum + chapter.duration, 0);

/** Millisecond offset at which each chapter begins. */
export const OFFSETS = CHAPTERS.reduce<number[]>((acc, chapter, index) => {
	acc.push(index === 0 ? 0 : acc[index - 1] + CHAPTERS[index - 1].duration);
	return acc;
}, []);
