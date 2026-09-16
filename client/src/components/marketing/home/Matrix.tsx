'use client';

import React from 'react';
import Reveal from '../Reveal';
import { Ziggurat } from '../Deco';

const COLUMNS = [
	{ name: 'Orchard', note: 'This platform', highlight: true },
	{ name: 'Legacy LMS', note: 'Canvas, Blackboard' },
	{ name: 'General AI', note: 'ChatGPT' },
	{ name: 'Niche AI Tutors', note: 'Khanmigo' },
];

/** Each row lists Orchard first; `lead` marks where Orchard holds the advantage. */
const ROWS: Array<{ label: string; cells: string[]; lead: boolean }> = [
	{
		label: 'Primary function',
		cells: ['Adaptive learning & automation', 'Content storage', 'General chat', 'Subject tutoring'],
		lead: true,
	},
	{
		label: 'Curriculum source',
		cells: [
			'The instructor’s syllabus only',
			'—',
			'Open internet',
			'Pre-set standardised curriculum',
		],
		lead: true,
	},
	{
		label: 'Hallucination risk',
		cells: ['Under 2% — grounded RAG', '—', 'High, 15–20%', 'Low'],
		lead: true,
	},
	{
		label: 'Cost structure',
		cells: [
			'Low — self-hosted Llama 3',
			'High — enterprise licence',
			'High — API or subscription',
			'Medium',
		],
		lead: true,
	},
	{
		label: 'Integration',
		cells: ['Native Canvas API', 'Native', 'None — copy and paste', 'Standalone app'],
		lead: false,
	},
	{
		label: 'Data sovereignty',
		cells: ['100% private', 'Private', 'Public training data', 'Private'],
		lead: true,
	},
	{
		label: 'Cheating prevention',
		cells: ['Process tracking', 'Plagiarism checker', 'Enables cheating', '—'],
		lead: true,
	},
];

export default function Matrix() {
	return (
		<section className="o-section o-matrix" id="comparison">
			<div className="o-shell">
				<div className="o-intro o-intro--center o-matrix__intro">
					<Reveal anim="fade">
						<Ziggurat />
					</Reveal>
					<Reveal delay={80}>
						<p className="o-eyebrow">Where Orchard sits</p>
					</Reveal>
					<Reveal anim="curtain" delay={160}>
						<h2 className="o-h2">Against every other option on the table</h2>
					</Reveal>
					<Reveal delay={240}>
						<p className="o-lede">
							Legacy platforms, general-purpose assistants and standalone tutors each
							solve a slice of the problem. None of them are grounded in the material a
							specific department teaches.
						</p>
					</Reveal>
				</div>

				<Reveal anim="fade" className="o-matrix__scroll">
					<table className="o-matrix__table">
						<caption className="o-visually-hidden">
							Feature comparison between Orchard, legacy learning management systems,
							general-purpose AI and niche AI tutors.
						</caption>
						<thead>
							<tr>
								<th scope="col">
									<span className="o-caps o-matrix__corner">Criterion</span>
								</th>
								{COLUMNS.map((column) => (
									<th
										key={column.name}
										scope="col"
										className={column.highlight ? 'is-lead' : ''}
									>
										<span className="o-matrix__colName">{column.name}</span>
										<span className="o-matrix__colNote">{column.note}</span>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{ROWS.map((row, rowIndex) => (
								<Reveal as="tr" key={row.label} anim="fade" delay={rowIndex * 70}>
									<th scope="row">{row.label}</th>
									{row.cells.map((cell, cellIndex) => (
										<td
											key={cellIndex}
											className={
												cellIndex === 0 ? `is-lead ${row.lead ? 'is-win' : ''}` : ''
											}
										>
											{cell}
										</td>
									))}
								</Reveal>
							))}
						</tbody>
					</table>
				</Reveal>

				<Reveal delay={120}>
					<p className="o-small o-matrix__hint">
						Figures drawn from the Orchard competitive analysis, December 2025.
					</p>
				</Reveal>
			</div>
		</section>
	);
}
