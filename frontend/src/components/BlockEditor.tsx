import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical, Plus, Type, Heading1, Heading2, Heading3, CheckSquare, Code, Quote, Minus, Database } from 'lucide-react';

export type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'checklist' | 'code' | 'quote' | 'divider';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

interface BlockEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  isViewer: boolean;
}

const SLASH_COMMANDS = [
  { icon: <Type size={14} />, label: 'Text', type: 'p', desc: 'Just start writing with plain text.' },
  { icon: <Heading1 size={14} />, label: 'Heading 1', type: 'h1', desc: 'Large section heading.' },
  { icon: <Heading2 size={14} />, label: 'Heading 2', type: 'h2', desc: 'Medium section heading.' },
  { icon: <Heading3 size={14} />, label: 'Heading 3', type: 'h3', desc: 'Small section heading.' },
  { icon: <CheckSquare size={14} />, label: 'To-do List', type: 'checklist', desc: 'Track tasks with a to-do list.' },
  { icon: <Code size={14} />, label: 'Code Snippet', type: 'code', desc: 'Capture a code snippet.' },
  { icon: <Quote size={14} />, label: 'Quote', type: 'quote', desc: 'Capture a quote.' },
  { icon: <Minus size={14} />, label: 'Divider', type: 'divider', desc: 'Visually divide sections.' },
];

export default function BlockEditor({ initialContent, onChange, isViewer }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [slashMenu, setSlashMenu] = useState<{ show: boolean, blockId: string | null, top: number, left: number, search: string }>({ show: false, blockId: null, top: 0, left: 0, search: '' });
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    try {
      if (initialContent.trim().startsWith('[')) {
        setBlocks(JSON.parse(initialContent));
      } else {
        setBlocks([{ id: Date.now().toString(), type: 'p', content: initialContent }]);
      }
    } catch {
      setBlocks([{ id: Date.now().toString(), type: 'p', content: initialContent || '' }]);
    }
  }, [initialContent]);

  const notifyChange = (newBlocks: Block[]) => {
    onChange(JSON.stringify(newBlocks));
  };

  const updateBlock = (index: number, content: string, partialUpdate?: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content, ...partialUpdate };
    setBlocks(newBlocks);
    notifyChange(newBlocks);
  };

  const addBlock = (index: number, type: BlockType = 'p') => {
    const newBlocks = [...blocks];
    const newBlock: Block = { id: Date.now().toString() + Math.random(), type, content: '' };
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    notifyChange(newBlocks);
    
    // focus new block
    setTimeout(() => {
      const el = document.getElementById(`block-${newBlock.id}`);
      if (el) el.focus();
    }, 10);
  };

  const turnIntoBlock = (index: number, type: BlockType) => {
    const newBlocks = [...blocks];
    const currentContent = newBlocks[index].content;
    const cleanContent = currentContent.replace(/^\//, '').replace(new RegExp(`^${slashMenu.search}`), '');
    
    newBlocks[index] = { ...newBlocks[index], type, content: cleanContent };
    if (type === 'divider') {
       // if divider, immediately add a P block below
       const newBlock: Block = { id: Date.now().toString() + Math.random(), type: 'p', content: '' };
       newBlocks.splice(index + 1, 0, newBlock);
    }
    
    setBlocks(newBlocks);
    notifyChange(newBlocks);
    setSlashMenu({ show: false, blockId: null, top: 0, left: 0, search: '' });

    setTimeout(() => {
       const focusId = type === 'divider' ? newBlocks[index + 1].id : newBlocks[index].id;
       const el = document.getElementById(`block-${focusId}`);
       if (el) {
          el.focus();
          // Move cursor to end
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
       }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number, block: Block) => {
    if (isViewer) { e.preventDefault(); return; }

    const target = e.target as HTMLDivElement;
    
    if (e.key === '/') {
       const rect = target.getBoundingClientRect();
       setSlashMenu({ show: true, blockId: block.id, top: rect.bottom + window.scrollY, left: rect.left, search: '' });
    }

    if (slashMenu.show) {
       if (e.key === 'Escape') {
          setSlashMenu({ ...slashMenu, show: false });
       } else if (e.key === 'Backspace' && target.innerText === '/') {
          setSlashMenu({ ...slashMenu, show: false });
       } else if (e.key !== 'Enter' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
          // crude tracking of search string
          setTimeout(() => {
             const match = target.innerText.match(/\/(\S*)$/);
             if (match) setSlashMenu(prev => ({ ...prev, search: match[1].toLowerCase() }));
             else setSlashMenu(prev => ({ ...prev, show: false }));
          }, 10);
       }
    }

    if (e.key === 'Enter') {
      if (slashMenu.show) {
         e.preventDefault();
         const matched = SLASH_COMMANDS.filter(cmd => cmd.label.toLowerCase().includes(slashMenu.search) || cmd.type.includes(slashMenu.search));
         if (matched.length > 0) turnIntoBlock(index, matched[0].type as BlockType);
         return;
      }
      e.preventDefault();
      addBlock(index, block.type === 'checklist' ? 'checklist' : 'p');
    }

    if (e.key === 'Backspace' && target.innerText === '') {
      e.preventDefault();
      if (slashMenu.show) setSlashMenu({ ...slashMenu, show: false });
      
      if (block.type !== 'p') {
         updateBlock(index, '', { type: 'p' });
      } else if (blocks.length > 1) {
         const newBlocks = [...blocks];
         newBlocks.splice(index, 1);
         setBlocks(newBlocks);
         notifyChange(newBlocks);
         
         const prevBlock = newBlocks[index - 1] || newBlocks[0];
         setTimeout(() => {
           const el = document.getElementById(`block-${prevBlock.id}`);
           if (el) {
             el.focus();
             const selection = window.getSelection();
             const range = document.createRange();
             range.selectNodeContents(el);
             range.collapse(false);
             selection?.removeAllRanges();
             selection?.addRange(range);
           }
         }, 10);
      }
    }
    
    // Up / Down arrow navigation
    if (e.key === 'ArrowUp' && !slashMenu.show) {
       const selection = window.getSelection();
       if (selection && selection.focusOffset === 0 && index > 0) {
          e.preventDefault();
          document.getElementById(`block-${blocks[index - 1].id}`)?.focus();
       }
    }
  };

  // Drag and Drop
  const onDragStart = (e: React.DragEvent, id: string) => {
    if (isViewer) return;
    setDraggedBlock(id);
    e.dataTransfer.effectAllowed = 'move';
    // Visual tweak
    setTimeout(() => {
       const el = document.getElementById(`block-row-${id}`);
       if (el) el.style.opacity = '0.3';
    }, 0);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetId) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = blocks.findIndex(b => b.id === targetId);

    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, removed);

    setBlocks(newBlocks);
    notifyChange(newBlocks);
    setDraggedBlock(null);
  };

  const onDragEnd = (id: string) => {
    setDraggedBlock(null);
    const el = document.getElementById(`block-row-${id}`);
    if (el) el.style.opacity = '1';
  };

  // Styles mapping
  const getBlockStyles = (type: BlockType) => {
    switch (type) {
      case 'h1': return 'text-4xl font-black mb-4 mt-6 tracking-tight text-foreground';
      case 'h2': return 'text-2xl font-bold mb-3 mt-5 tracking-tight text-foreground';
      case 'h3': return 'text-xl font-bold mb-2 mt-4 text-foreground/80';
      case 'quote': return 'text-lg italic border-l-4 border-primary pl-4 py-1 my-3 text-muted-foreground bg-primary/5 rounded-r-lg';
      case 'code': return 'font-mono text-sm bg-slate-900 text-emerald-400 p-4 rounded-xl shadow-inner border border-slate-800 my-2 block overflow-x-auto';
      default: return 'text-base leading-relaxed text-foreground min-h-[24px] py-1';
    }
  };

  const filteredSlash = SLASH_COMMANDS.filter(cmd => cmd.label.toLowerCase().includes(slashMenu.search) || cmd.type.includes(slashMenu.search));

  return (
    <div className="relative w-full max-w-4xl mx-auto py-10 px-4 sm:px-12 pb-40" ref={containerRef}>
      
      {/* Title block pseudo-feel */}
      <div className="mb-10 text-muted-foreground/30 text-sm font-bold uppercase tracking-widest border-b border-border pb-4 pointer-events-none">
         Block-Based Enterprise Editor
      </div>

      {blocks.map((block, index) => (
        <div 
          key={block.id}
          id={`block-row-${block.id}`}
          className="group relative flex items-start gap-2 -ml-8 pr-2 rounded transition-colors hover:bg-secondary/30"
          draggable={!isViewer}
          onDragStart={(e) => onDragStart(e, block.id)}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, block.id)}
          onDragEnd={() => onDragEnd(block.id)}
        >
          {/* Drag Handle & Left Controls */}
          {!isViewer && (
            <div className="w-8 shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 cursor-grab active:cursor-grabbing">
              <button 
                onClick={() => addBlock(index)}
                className="p-0.5 text-muted-foreground hover:bg-background rounded hover:text-primary transition-colors"
              >
                <Plus size={14} />
              </button>
              <div className="p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                <GripVertical size={14} />
              </div>
            </div>
          )}
          {isViewer && <div className="w-8 shrink-0" />}

          {/* Block Content Wrapper */}
          <div className="flex-1 relative min-w-0 flex items-start gap-3">
             {block.type === 'checklist' && (
               <input 
                 type="checkbox" 
                 checked={block.checked || false}
                 onChange={(e) => updateBlock(index, block.content, { checked: e.target.checked })}
                 disabled={isViewer}
                 className="mt-2.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all" 
               />
             )}
             
             {block.type === 'divider' ? (
               <div className="w-full h-px bg-border my-6" />
             ) : (
               <div 
                 id={`block-${block.id}`}
                 contentEditable={!isViewer}
                 suppressContentEditableWarning
                 className={`flex-1 outline-none ${getBlockStyles(block.type)} ${block.checked ? 'line-through opacity-50' : ''}`}
                 onKeyDown={(e) => handleKeyDown(e, index, block)}
                 onBlur={(e) => {
                    const text = e.target.innerText;
                    if (targetIdForMenuRef.current === block.id) return; // ignore blur if typing in slash menu
                    updateBlock(index, block.content !== e.target.innerHTML ? e.target.innerHTML : block.content);
                 }}
                 data-placeholder={block.type === 'p' && index === blocks.length -1 ? "Type '/' for commands" : ""}
                 dangerouslySetInnerHTML={{ __html: block.content }}
               />
             )}
          </div>
        </div>
      ))}

      {/* Zero State */}
      {blocks.length === 0 && !isViewer && (
         <button onClick={() => addBlock(-1)} className="mt-4 text-muted-foreground/60 italic hover:text-primary flex items-center gap-2">
            <Plus size={16} /> Click to start typing...
         </button>
      )}

      {/* Slash Command Overlay */}
      {slashMenu.show && !isViewer && (
        <div 
          className="fixed z-[200] w-64 bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-fade-scale-in"
          style={{ top: slashMenu.top + 20, left: slashMenu.left }}
        >
           <div className="bg-secondary/50 p-2 border-b border-border text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center justify-between">
              Insert Block
              {slashMenu.search && <span className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">/{slashMenu.search}</span>}
           </div>
           <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
              {filteredSlash.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground text-center font-bold">No blocks found</div>
              )}
              {filteredSlash.map((cmd, i) => (
                 <button
                   key={cmd.type}
                   onClick={() => {
                     const idx = blocks.findIndex(b => b.id === slashMenu.blockId);
                     if (idx !== -1) turnIntoBlock(idx, cmd.type as BlockType);
                   }}
                   className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-primary/10 hover:text-primary group ${i === 0 ? 'bg-secondary/40' : ''}`}
                 >
                    <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors">
                       {cmd.icon}
                    </div>
                    <div className="flex-1">
                       <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{cmd.label}</h4>
                       <p className="text-[10px] text-muted-foreground">{cmd.desc}</p>
                    </div>
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

// Keep track of slash menu block for blur avoidance
const targetIdForMenuRef = { current: null as string | null };
