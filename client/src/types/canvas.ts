export interface CourseCanvasLink {
	connected: boolean;
	canvasCourseId?: number;
	canvasCourseName?: string;
	canvasCourseUrl?: string;
	linkedAt?: string;
}

export interface CanvasConnectionStatus {
	connected: boolean;
	canvasUserId?: number;
	connectedAt?: string;
	institutionName?: string;
}

export interface CanvasCourseOption {
	id: number;
	name: string;
	courseCode?: string;
	workflowState?: string;
}
