'use client';

import { useState, useEffect } from 'react';
import { useSearchAssessments, useSupplierAssessmentPage } from '@/src/api/supplier-assessment';
import { Assessment, Template } from '@/src/types/supplier-assessment';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { GlobalLoading } from '@/src/components/global-loading';
import CreateAssessmentModal from '@/src/components/supplier-assessment/create-assessment-modal';
import { ErrorComponent } from '@/src/components/ui/error';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';

export default function SupplierAssessmentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { assessments, totalPages, isLoading, isError } = useSearchAssessments();
  const { pageData, isLoading: isLoadingPageData, isError: isErrorPageData } = useSupplierAssessmentPage();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (pageData) {
      setSelectedTemplate(pageData.templates[0]);
    }
  }, [pageData]);

  if (isLoading || isLoadingPageData) {
    return <GlobalLoading />;
  }

  if (isError || isErrorPageData) {
    return <ErrorComponent title="Error Loading Data" description="There was an error loading the supplier assessment data. Please try again later." />;
  }
  
  return (
    <div className="bg-gray-50 font-arial text-base">
      <main className="max-w-7xl mx-auto px-5 py-8">
        <PageHeader onOpenModal={() => setIsModalOpen(true)} />
        {pageData && <SearchAndFilter filters={pageData.FILTERS} />}
        <AssessmentGrid assessments={assessments || []} />
        <Pagination totalPages={totalPages} />
      </main>
      {pageData && selectedTemplate && (
        <CreateAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          templates={pageData.templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      )}
    </div>
  );
}

function PageHeader({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section id="page-header" className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Supplier Assessment
          </h1>
          <p className="text-gray-600">
            Evaluate supplier risks, material origins, and tariff implications
            for strategic sourcing decisions
          </p>
        </div>
        <Button
          id="create-assessment-btn"
          onClick={onOpenModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Assessment
        </Button>
      </div>
    </section>
  );
}

function SearchAndFilter({ filters }: { filters: { topics: string[]; creators: string[] } }) {
  const router = useRouter();

  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    if (e.target.value) {
      params.set('title', e.target.value);
    } else {
      params.delete('title');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, 300);

  return (
    <section id="search-filter" className="mb-8">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments..."
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            {Object.keys(filters).map((filter) => (
              <select
                key={filter}
                className="px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filters[filter as keyof typeof filters].map((option: string) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ))}
            <Button variant="outline">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssessmentGrid({ assessments }: { assessments: Assessment[] }) {
  if (!assessments) return null;
  return (
    <section id="assessment-grid" className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </section>
  );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
    const {
      title,
      description,
      topic,
      creator,
      createdAt,
      updatedAt,
      status,
      tags,
      icon,
      topicColor,
    } = assessment;
  
    const statusClasses = {
      Complete: 'bg-green-100 text-green-700',
      Draft: 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-accent/20 text-accent',
    };
  
    const iconColorClasses = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
    };
  
    return (
      <div className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 ${
                iconColorClasses[topicColor as keyof typeof iconColorClasses]
              } rounded-lg flex items-center justify-center`}
            >
              <i className={`fas ${icon} text-sm`}></i>
            </div>
            <span
              className={`px-2 py-1 ${
                iconColorClasses[topicColor as keyof typeof iconColorClasses]
              } text-xs rounded`}
            >
              {topic}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
  
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span className="text-gray-900">{createdAt}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Creator:</span>
            <span className="text-gray-900">{creator}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Updated:</span>
            <span className="text-gray-900">{updatedAt}</span>
          </div>
        </div>
  
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary/50 text-primary text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
  
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 ${
              statusClasses[status]
            } text-xs rounded`}
          >
            {status}
          </span>
          <Link href={`/supplier-assessment/preview/${assessment.id}`}>
            <span className="text-primary text-sm font-medium hover:underline">
              View Details →
            </span>
          </Link>
        </div>
      </div>
    );
  }
  

function Pagination({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const params = new URLSearchParams(window.location.search);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <section id="pagination" className="flex justify-end items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
      >
        <ChevronRight />
      </Button>
    </section>
  );
}
  
