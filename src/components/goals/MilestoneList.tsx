"use client";
import { useState, useTransition } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Check, Plus } from "lucide-react";
import { updateMilestonePositions, toggleMilestone, deleteMilestone } from "@/app/goals/actions";

export type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  position: number;
};

// Sortable Item Component
function SortableMilestoneRow({ 
  milestone, 
  onToggle, 
  onDelete, 
  readonly = false 
}: { 
  milestone: Milestone; 
  onToggle?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  readonly?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-center gap-3 py-1.5 ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Drag handle */}
      {!readonly && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox */}
      {onToggle && (
        <button
          onClick={() => onToggle(milestone.id, !milestone.completed)}
          className={`flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${
            milestone.completed 
              ? "bg-sky-500 border-sky-500 text-white" 
              : "border-slate-300 dark:border-slate-600 hover:border-sky-400"
          }`}
        >
          {milestone.completed && <Check className="w-3 h-3" />}
        </button>
      )}

      {/* Title */}
      <span className={`text-[14px] flex-1 truncate transition-all ${
        milestone.completed ? "line-through text-muted-foreground" : "text-foreground"
      }`}>
        {milestone.title}
      </span>

      {/* Delete button */}
      {!readonly && onDelete && (
        <button 
          onClick={() => onDelete(milestone.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-[6px] transition-all flex-shrink-0"
          title="Delete milestone"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function MilestoneList({ 
  milestones: initialMilestones, 
  readonly = false 
}: { 
  milestones: Milestone[];
  readonly?: boolean;
}) {
  const [items, setItems] = useState(initialMilestones.sort((a, b) => a.position - b.position));
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save to DB
        startTransition(() => {
          updateMilestonePositions(newItems.map((item, index) => ({ id: item.id, position: index })));
        });
        
        return newItems;
      });
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    setItems(items.map(m => m.id === id ? { ...m, completed } : m));
    startTransition(() => {
      toggleMilestone(id, completed);
    });
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(m => m.id !== id));
    startTransition(() => {
      deleteMilestone(id);
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((m) => (
            <SortableMilestoneRow 
              key={m.id} 
              milestone={m} 
              onToggle={readonly ? undefined : handleToggle} 
              onDelete={readonly ? undefined : handleDelete} 
              readonly={readonly} 
            />
          ))}
        </SortableContext>
      </DndContext>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-2">No milestones defined.</p>
      )}
    </div>
  );
}
