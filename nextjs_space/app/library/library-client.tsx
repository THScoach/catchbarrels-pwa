
'use client';

import { useState } from 'react';
import { BookOpen, Play, FileText, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import CoachRickChat from '@/components/coach-rick-chat';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  difficulty?: string | null;
  modules: Module[];
  tags: any[];
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  lessonType: string;
  duration?: number | null;
  assets: Asset[];
}

interface Asset {
  id: string;
  title: string;
  assetType: string;
  fileUrl?: string | null;
  extractedText?: string | null;
}

export default function LibraryClient({ courses }: { courses: Course[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Filter courses by search
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.category?.toLowerCase().includes(query)
    );
  });

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0a0f1a] pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#0f1621] border-b border-[#2a3f5f] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#2196F3]" />
              Training Library
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">
              Access your complete training content
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6a7280]" />
            <input
              type="text"
              placeholder="Search courses, lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-[#2a3f5f] rounded-lg text-white placeholder-[#4a5568] focus:outline-none focus:border-[#2196F3] transition-colors"
            />
          </div>
        </div>

        {/* Course List View */}
        {!selectedCourse && (
          <div className="max-w-4xl mx-auto px-4 pb-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-[#4a5568] mx-auto mb-4" />
                <p className="text-[#8b949e] text-lg">
                  {searchQuery ? 'No courses found' : 'No training content available yet'}
                </p>
                <p className="text-[#6a7280] text-sm mt-2">
                  Check back soon for new content!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-4 hover:border-[#2196F3] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {course.thumbnail && (
                        <div className="w-20 h-20 bg-[#2a3f5f] rounded-lg flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {course.title}
                          </h3>
                          {course.difficulty && (
                            <span className="px-2 py-1 bg-[#2a3f5f] text-[#8b949e] text-xs rounded-full whitespace-nowrap">
                              {course.difficulty}
                            </span>
                          )}
                        </div>
                        
                        {course.description && (
                          <p className="text-sm text-[#8b949e] line-clamp-2 mb-2">
                            {course.description}
                          </p>
                        )}
                        
                        {course.category && (
                          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {course.category}
                          </span>
                        )}
                        
                        <div className="text-xs text-[#6a7280] mt-2">
                          {course.modules.length} modules • {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Course Detail View */}
        {selectedCourse && !selectedLesson && (
          <div className="max-w-4xl mx-auto px-4 pb-4">
            {/* Back Button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-[#2196F3] text-sm mb-4 hover:text-[#1976D2] transition-colors"
            >
              ← Back to Library
            </button>

            {/* Course Header */}
            <div className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedCourse.title}
              </h2>
              {selectedCourse.description && (
                <p className="text-[#8b949e] mb-4">
                  {selectedCourse.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {selectedCourse.category && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                    {selectedCourse.category}
                  </span>
                )}
                {selectedCourse.difficulty && (
                  <span className="px-3 py-1 bg-[#2a3f5f] text-[#8b949e] text-sm rounded-full">
                    {selectedCourse.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Modules & Lessons */}
            <div className="space-y-3">
              {selectedCourse.modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg overflow-hidden"
                >
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-[#1f2937] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-5 h-5 text-[#2196F3]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#8b949e]" />
                      )}
                      <div className="text-left">
                        <h3 className="text-white font-semibold">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-[#8b949e]">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#6a7280]">
                      {module.lessons.length} lessons
                    </span>
                  </button>

                  {/* Lessons */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-[#2a3f5f]">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className="w-full p-4 flex items-start gap-3 hover:bg-[#1f2937] transition-colors border-b border-[#2a3f5f] last:border-b-0"
                        >
                          {lesson.lessonType === 'video' ? (
                            <Play className="w-5 h-5 text-[#2196F3] flex-shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#2196F3] flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-white text-sm font-medium">
                              {lesson.title}
                            </p>
                            {lesson.description && (
                              <p className="text-xs text-[#8b949e] line-clamp-1 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          {lesson.duration && (
                            <span className="text-xs text-[#6a7280] flex-shrink-0">
                              {lesson.duration} min
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Detail View */}
        {selectedLesson && (
          <div className="max-w-4xl mx-auto px-4 pb-4">
            {/* Back Button */}
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-[#2196F3] text-sm mb-4 hover:text-[#1976D2] transition-colors"
            >
              ← Back to Course
            </button>

            {/* Lesson Content */}
            <div className="bg-[#1a2332] border border-[#2a3f5f] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedLesson.title}
              </h2>

              {selectedLesson.description && (
                <p className="text-[#8b949e] mb-4">
                  {selectedLesson.description}
                </p>
              )}

              {/* Lesson Content */}
              {selectedLesson.content && (
                <div className="bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg p-4 mb-4">
                  <div className="text-sm text-[#8b949e] whitespace-pre-wrap">
                    {selectedLesson.content}
                  </div>
                </div>
              )}

              {/* Assets */}
              {selectedLesson.assets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Resources</h3>
                  {selectedLesson.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-[#0a0f1a] border border-[#2a3f5f] rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {asset.assetType === 'video' && (
                          <Play className="w-5 h-5 text-[#2196F3]" />
                        )}
                        {asset.assetType === 'pdf' && (
                          <FileText className="w-5 h-5 text-[#2196F3]" />
                        )}
                        <span className="text-white text-sm">{asset.title}</span>
                      </div>
                      {asset.fileUrl && (
                        <a
                          href={asset.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#2196F3] text-white text-sm rounded hover:bg-[#1976D2] transition-colors"
                        >
                          Open
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
      <CoachRickChat />
    </>
  );
}
