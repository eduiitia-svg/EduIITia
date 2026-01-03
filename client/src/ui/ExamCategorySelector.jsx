import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Beaker,
  Zap,
  BookOpen,
  Target,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { getAllCategories } from "../slices/categorySlice";

const ExamCategorySelector = ({ onCategorySelect, filterByCategory }) => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const getIconComponent = (iconName) => {
    const icons = {
      GraduationCap,
      Beaker,
      Zap,
      BookOpen,
      Target,
    };
    return icons[iconName] || BookOpen;
  };

  const filteredCategories = useMemo(() => {
    if (!filterByCategory) return categories;

    const normalizedFilter = filterByCategory.toLowerCase();

    return categories.filter((category) => {
      const normalizedCategoryName = category.name.toLowerCase();
      return (
        normalizedCategoryName.includes(normalizedFilter) ||
        normalizedFilter.includes(normalizedCategoryName) ||
        (normalizedFilter === "school" &&
          category.type?.toLowerCase() === "school") ||
        (normalizedFilter === "entrance" &&
          category.type?.toLowerCase() === "competitive") ||
        (normalizedFilter === "recruitment" &&
          category.type?.toLowerCase() === "competitive")
      );
    });
  }, [categories, filterByCategory]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSubject = (categoryId, subjectName) => {
    const key = `${categoryId}-${subjectName}`;
    setExpandedSubjects((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubject(null);
    onCategorySelect(category, null, null);
    toggleCategory(category.id);
  };

  const handleSubjectClick = (category, subject) => {
    setSelectedCategory(category);
    setSelectedSubject(subject);
    onCategorySelect(category, subject.name, null);
  };

  const handleSubcategoryClick = (category, subject, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubject(subject);
    onCategorySelect(category, subject.name, subcategory);
  };

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
        <p className="text-gray-600 dark:text-gray-400">
          {filterByCategory
            ? `No categories found for "${filterByCategory}"`
            : "No categories available"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎓</span>
        Choose Your Exam
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const normalizedSubjects = category.subjects.map((subj) =>
            typeof subj === "string" ? { name: subj, subcategories: [] } : subj
          );
          const Icon = getIconComponent(category.icon);

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all"
            >
              <button
                onClick={() => handleCategoryClick(category)}
                className={`w-full p-4 flex items-center justify-between transition-all ${
                  selectedCategory?.id === category.id
                    ? "bg-emerald-500/10 border-b border-emerald-500/20"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {category.type}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`text-gray-500 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2 bg-gray-50 dark:bg-black/20">
                      {normalizedSubjects.map((subject) => {
                        const hasSubcategories =
                          subject.subcategories &&
                          subject.subcategories.length > 0;
                        const subjectKey = `${category.id}-${subject.name}`;
                        const isSubjectExpanded = expandedSubjects[subjectKey];

                        return (
                          <div key={subject.name} className="space-y-1">
                            <button
                              onClick={() => {
                                if (hasSubcategories) {
                                  toggleSubject(category.id, subject.name);
                                } else {
                                  handleSubjectClick(category, subject);
                                }
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-all ${
                                selectedSubject?.name === subject.name &&
                                !isSubjectExpanded
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                  : "hover:bg-white dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <span className="flex items-center gap-2 text-sm font-medium">
                                <ChevronRight size={14} />
                                {subject.name}
                              </span>
                              {hasSubcategories && (
                                <ChevronDown
                                  className={`text-gray-500 transition-transform ${
                                    isSubjectExpanded ? "rotate-180" : ""
                                  }`}
                                  size={16}
                                />
                              )}
                            </button>

                            <AnimatePresence>
                              {hasSubcategories && isSubjectExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-6 space-y-1"
                                >
                                  {subject.subcategories.map((subcategory) => (
                                    <button
                                      key={subcategory}
                                      onClick={() =>
                                        handleSubcategoryClick(
                                          category,
                                          subject,
                                          subcategory
                                        )
                                      }
                                      className="w-full px-3 py-1.5 rounded-lg text-left hover:bg-teal-100 dark:hover:bg-teal-500/20 text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 text-xs transition-all flex items-center gap-2"
                                    >
                                      <ChevronRight size={12} />
                                      {subcategory}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamCategorySelector;
