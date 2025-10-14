'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Bold, Heading2, ImageUp, Italic, List, ListOrdered, Quote } from 'lucide-react'

interface NoteComposerProps {
  onCreate: (note: { content: string; page?: number }) => Promise<void> | void
  defaultPage?: number
}

function ToolbarButton({
  onClick,
  isActive,
  label,
  icon: Icon,
}: {
  onClick: () => void
  isActive?: boolean
  label: string
  icon: typeof Bold
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-300 dark:hover:text-white ${
        isActive
          ? 'border-sky-400 bg-sky-100/70 text-sky-700 dark:border-sky-500 dark:bg-sky-500/20 dark:text-sky-100'
          : 'border-transparent bg-white/60 dark:bg-slate-900/60'
      }`}
      aria-label={label}
    >
      <Icon className='h-4 w-4' aria-hidden />
    </button>
  )
}

/**
 * Rich text editor allowing formatted notes, bullet lists and inline images.
 */
export function NoteComposer({ onCreate, defaultPage }: NoteComposerProps) {
  const [page, setPage] = useState<number | ''>(defaultPage ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: 'Ghi chú, mô tả, hình ảnh minh họa...' }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true, allowBase64: true }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none text-slate-800 dark:prose-invert dark:text-slate-100',
      },
    },
  })

  useEffect(() => {
    setPage(defaultPage ?? '')
  }, [defaultPage])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!editor) {
      return
    }

    const plainText = editor.getText().trim()
    if (!plainText) {
      setError('Nội dung ghi chú không được bỏ trống')
      return
    }

    try {
      setIsSubmitting(true)
      const pageNumber = typeof page === 'number' ? page : undefined
      await onCreate({ content: editor.getHTML(), page: pageNumber })
      editor.commands.clearContent(true)
    } catch (submitError) {
      console.error(submitError)
      setError('Không thể lưu ghi chú. Hãy thử lại')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleAddImage() {
    if (!editor) return
    const url = window.prompt('Dán đường dẫn hình ảnh (https://...)')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <label className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
          Trang
          <input
            type='number'
            value={page}
            min={1}
            className='mt-1 w-24 rounded-md border border-slate-300/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30'
            onChange={event => setPage(event.target.value ? Number(event.target.value) : '')}
          />
        </label>
      </div>

      <div className='space-y-2'>
        <div className='flex flex-wrap gap-2'>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            label='In đậm'
            icon={Bold}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            label='In nghiêng'
            icon={Italic}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
            label='Tiêu đề'
            icon={Heading2}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            label='Danh sách chấm'
            icon={List}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            label='Danh sách số'
            icon={ListOrdered}
          />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
            label='Trích dẫn'
            icon={Quote}
          />
          <ToolbarButton onClick={handleAddImage} label='Chèn hình ảnh' icon={ImageUp} />
        </div>
        <div className='editor-surface'>
          <EditorContent editor={editor} />
        </div>
      </div>

      {error ? (
        <p className='rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500 dark:text-red-300'>
          {error}
        </p>
      ) : null}
      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-wait disabled:opacity-70'
      >
        {isSubmitting ? 'Đang lưu...' : 'Lưu ghi chú'}
      </button>
    </form>
  )
}
