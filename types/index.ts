export interface ListField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date';
    required: boolean;
}

export interface List {
    id: string;
    userId: string;
    title: string;
    description?: string;
    fields: ListField[];
    createdAt: number;
    updatedAt: number;
    hasPendingWrites?: boolean;
}

export interface ListItem {
    id: string;
    listId: string;
    data: Record<string, any>; // Keyed by field.id
    completed?: boolean;
    createdAt: number;
    updatedAt: number;
}
