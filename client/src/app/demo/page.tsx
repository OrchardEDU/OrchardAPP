'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import './demo.css';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	sources?: string[];
}

interface UploadedFile {
	id: string;
	name: string;
	size: number;
}

export default function DemoPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [uploadingFile, setUploadingFile] = useState<string | null>(null);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom of chat
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || !password.trim()) return;

		const userMessage: Message = { role: 'user', content: input };
		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput('');
		setIsLoading(true);
		let response;
		try {
			const apiBase =
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				(typeof window !== 'undefined' ? window.location.origin : '');

			response = await fetch(`${apiBase}/api/demo`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password, prompt: currentInput }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					// Invalid password
					const errorMessage: Message = {
						role: 'assistant',
						content: 'Invalid password. Please check your password and try again.',
					};
					setMessages((prev) => [...prev, errorMessage]);
					return;
				}
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('DEMO ERROR: Failed to fetch response from API', error);
			const errorMessage: Message = {
				role: 'assistant',
				content:
					'Failed to connect to the server. Please check your internet connection and try again.',
			};
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}
		let data;
		try {
			data = await response.json();
		} catch (error) {
			console.error('DEMO ERROR: Failed to parse JSON response', data);
		}

		if (!data.success) {
			const errorMessage: Message = {
				role: 'assistant',
				content: data.message || 'Failed to process your request. Please try again.',
			};
			setMessages((prev) => [...prev, errorMessage]);
			return;
		}

		// TODO: turn this into a structured output system
		// Extract the generated question from the response
		try {
			let content = 'No response from demo endpoint.';
			if (data?.data?.question) {
				content = data.data.question;
			} else if (data?.data?.ollamaResponse?.message?.content) {
				content = data.data.ollamaResponse.message.content;
			} else if (data?.data?.ollamaResponse?.choices?.[0]?.message?.content) {
				content = data.data.ollamaResponse.choices[0].message.content;
			} else if (data?.message) {
				content = data.message;
			}
			console.log('--------RESPONSE CONTENT--------');
			console.log(content);
			console.log('--------RESPONSE CONTENT--------');

			const aiMessage: Message = {
				role: 'assistant',
				content,
				sources: data.sources,
			};

			setMessages((prev) => [...prev, aiMessage]);
		} catch (error) {
			console.error('DEMO ERROR: Failed to extract content from response', error);
			const errorMessage: Message = {
				role: 'assistant',
				content:
					error instanceof Error
						? error.message
						: 'Sorry, there was an error processing your request. Please try again.',
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Require password before uploading
		if (!password.trim()) {
			alert('Please enter the demo password before uploading a file.');
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			return;
		}

		setUploadingFile(file.name);

		try {
			const apiBase =
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				(typeof window !== 'undefined' ? window.location.origin : '');

			const formData = new FormData();
			formData.append('file', file);
			formData.append('password', password);

			const response = await fetch(`${apiBase}/api/demo/upload`, {
				method: 'POST',
				body: formData,
			});

			// Handle non-OK responses first
			if (!response.ok) {
				if (response.status === 404) {
					alert('API endpoint not found. Make sure the server is running.');
					return;
				}

				// Try to parse JSON error response
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					try {
						const errorData = await response.json();
						if (response.status === 401) {
							alert(
								errorData.message ||
									'Invalid password. Please check your password and try again.'
							);
						} else {
							alert(
								errorData.message ||
									`Error: ${response.status} ${response.statusText}`
							);
						}
						return;
					} catch {
						// If JSON parsing fails, show generic error
						alert(`Error ${response.status}: ${response.statusText}`);
						return;
					}
				} else {
					// HTML or other non-JSON response
					if (response.status === 401) {
						alert('Invalid password. Please check your password and try again.');
					} else {
						alert(`Error ${response.status}: ${response.statusText}`);
					}
					return;
				}
			}

			// Parse successful response
			let data;
			try {
				data = await response.json();
			} catch (error) {
				alert('Failed to parse server response. Please try again.');
				return;
			}

			if (!data.success) {
				alert(data.message || 'Failed to upload file. Please try again.');
				return;
			}

			if (data.data) {
				// Only add file to list after successful upload
				const newFile: UploadedFile = {
					id: data.data.id,
					name: data.data.filename,
					size: data.data.size,
				};
				setUploadedFiles((prev) => [...prev, newFile]);
			}
		} catch (error) {
			console.error('File upload error:', error);
			alert(
				error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
			);
		} finally {
			setUploadingFile(null);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleRemoveFile = async (fileId: string) => {
		if (!password.trim()) {
			alert('Please enter the demo password to remove files.');
			return;
		}

		try {
			const apiBase =
				process.env.NEXT_PUBLIC_API_BASE_URL ||
				(typeof window !== 'undefined' ? window.location.origin : '');

			const response = await fetch(
				`${apiBase}/api/demo/upload/${fileId}?password=${encodeURIComponent(password)}`,
				{
					method: 'DELETE',
				}
			);

			// Handle non-OK responses first
			if (!response.ok) {
				if (response.status === 404) {
					alert('API endpoint not found. Make sure the server is running.');
					return;
				}

				// Try to parse JSON error response
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					try {
						const errorData = await response.json();
						if (response.status === 401) {
							alert(
								errorData.message ||
									'Invalid password. Please check your password and try again.'
							);
						} else {
							alert(
								errorData.message ||
									`Error: ${response.status} ${response.statusText}`
							);
						}
						return;
					} catch {
						// If JSON parsing fails, show generic error
						alert(`Error ${response.status}: ${response.statusText}`);
						return;
					}
				} else {
					// HTML or other non-JSON response
					if (response.status === 401) {
						alert('Invalid password. Please check your password and try again.');
					} else {
						alert(`Error ${response.status}: ${response.statusText}`);
					}
					return;
				}
			}

			// Parse successful response
			let data;
			try {
				data = await response.json();
			} catch (error) {
				alert('Failed to parse server response. Please try again.');
				return;
			}

			if (!data.success) {
				alert(data.message || 'Failed to delete file. Please try again.');
				return;
			}

			// Remove file from list after successful deletion
			setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
		} catch (error) {
			console.error('File deletion error:', error);
			alert(
				error instanceof Error ? error.message : 'Failed to delete file. Please try again.'
			);
		}
	};

	return (
		<div className="demo-container">
			{/* Sidebar for RAG Context */}
			<aside className="knowledge-base">
				<h3>Knowledge Base</h3>
				<p className="subtitle">Upload docs to provide context for the LLM</p>
				<div className="upload-section">
					<input
						type="file"
						id="file-upload"
						ref={fileInputRef}
						onChange={handleFileUpload}
						disabled={!!uploadingFile}
						hidden
					/>
					<label
						htmlFor="file-upload"
						className={`upload-label ${uploadingFile ? 'uploading' : ''}`}
					>
						<span>
							{uploadingFile ? `Uploading ${uploadingFile}...` : '+ Add Document'}
						</span>
					</label>
				</div>
				<div className="doc-list">
					{uploadedFiles.length === 0 ? (
						<p className="no-docs">No documents uploaded yet</p>
					) : (
						uploadedFiles.map((file) => (
							<div key={file.id} className="doc-item">
								<span>📄 {file.name}</span>
								<button
									className="remove-file-btn"
									onClick={() => handleRemoveFile(file.id)}
									title="Remove file"
								>
									×
								</button>
							</div>
						))
					)}
				</div>
			</aside>

			{/* Main Chat Area */}
			<main className="chat-interface">
				<header className="chat-header">
					<div className="chat-header-left">
						<Link href="/" className="back-button">
							←
						</Link>
						<h2>RAG LLM Implementation Demo</h2>
					</div>
					<span className="status-badge">Live Interface</span>
				</header>

				<div className="messages-container">
					{messages.map((msg, idx) => (
						<div key={idx} className={`message-bubble ${msg.role}`}>
							<div className="message-content">{msg.content}</div>
							{msg.sources && (
								<div className="sources-list">
									Sources: {msg.sources.join(', ')}
								</div>
							)}
						</div>
					))}
					{isLoading && <div className="loader">AI is thinking...</div>}
					<div ref={chatEndRef} />
				</div>

				<form className="input-area" onSubmit={handleSendMessage}>
					<input
						type="password"
						placeholder="Enter demo password..."
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter a prompt for the demo..."
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
					<button type="submit" className="btn-send" disabled={isLoading}>
						Send
					</button>
				</form>
			</main>
		</div>
	);
}
