"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/Button";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 border-b border-primary/10 bg-surface/30">
            <Button
                type="button"
                variant={editor.isActive('bold') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="font-bold"
            >
                B
            </Button>
            <Button
                type="button"
                variant={editor.isActive('italic') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="italic"
            >
                I
            </Button>
            <Button
                type="button"
                variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                H2
            </Button>
            <Button
                type="button"
                variant={editor.isActive('bulletList') ? 'primary' : 'outline'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                Liste
            </Button>
        </div>
    )
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4 max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="border border-primary/20 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/50 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
