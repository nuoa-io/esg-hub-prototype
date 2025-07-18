'use client';

import { useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import QuestionComponent from './Question';
import { Button } from '@/src/components/ui/button';

export default function SectionComponent({ sectionIndex, control, register, removeSection, errors }: any) {
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.questions`
    });

    return (
        <div className="border border-border rounded-lg p-6 mb-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
                <input
                    {...register(`sections.${sectionIndex}.title`, { required: 'Section title is required' })}
                    placeholder="Section Title"
                    className="text-xl font-medium text-gray-900 bg-transparent border-b-2 w-full p-1"
                />
                <Button type="button" variant="ghost" onClick={() => removeSection(sectionIndex)} className="text-gray-400 hover:text-error">
                    <X size={20} />
                </Button>
            </div>
            {errors.sections?.[sectionIndex]?.title && <p className="text-red-500 text-sm mb-2">{errors.sections[sectionIndex].title.message}</p>}

            {questionFields.map((field, qIndex) => (
                <QuestionComponent
                    key={field.id}
                    sectionIndex={sectionIndex}
                    questionIndex={qIndex}
                    control={control}
                    register={register}
                    removeQuestion={removeQuestion}
                    errors={errors}
                />
            ))}

            <Button type="button" variant="link" onClick={() => appendQuestion({ id: uuidv4(), text: '', type: 'text' })} className="mt-4">
                <Plus size={20} />
                <span>Add Question</span>
            </Button>
        </div>
    );
} 