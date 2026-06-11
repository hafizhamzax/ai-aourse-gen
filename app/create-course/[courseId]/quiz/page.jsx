"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import { useUserDetail } from '@/app/_context/UserDetailContext';

function QuizPage({ params }) {
    const { userDetail } = useUserDetail();
    const router = useRouter();
    const resolvedParams = use(params);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionIndex: option }
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (resolvedParams?.courseId) {
            fetchQuiz();
        }
    }, [resolvedParams]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.post('/api/get-course-quiz', { courseId: resolvedParams.courseId });
            if (res.data.quiz) {
                setQuestions(res.data.quiz.questions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleOptionSelect = (option) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
        setSelectedOption(option);
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            const nextAnswer = answers[currentQuestionIndex + 1];
            setSelectedOption(nextAnswer || null);
        } else {
            submitQuiz();
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            const prevAnswer = answers[currentQuestionIndex - 1];
            setSelectedOption(prevAnswer || null);
        }
    }

    const submitQuiz = async () => {
        let correctCount = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setIsSubmitted(true);

        if (userDetail?.email) {
            try {
                await axios.post('/api/save-quiz-result', {
                    courseId: resolvedParams.courseId,
                    userId: userDetail.email,
                    score: correctCount,
                    totalQuestions: questions.length
                });
            } catch (error) {
                console.error('Error saving result:', error);
            }
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (questions.length === 0) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-600">
            <h2 className="text-2xl font-bold mb-4">No Quiz Available</h2>
            <p className="mb-6">The creator hasn&apos;t generated a quiz for this course yet.</p>
            <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-purple-700">Go Back</button>
        </div>
    );

    if (isSubmitted) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className='min-h-screen bg-gray-50 p-8 md:p-12 flex justify-center'>
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-8">
                    <div className="text-center mb-10">
                        <div className="inline-block p-4 rounded-full bg-yellow-100 mb-4">
                            <FaTrophy className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h2 className='text-3xl font-bold text-gray-800 mb-2'>Quiz Result</h2>
                        <p className="text-gray-500">You scored {score} out of {questions.length}</p>

                        <div className="mt-6 flex justify-center">
                            <div className="w-full max-w-md bg-gray-200 rounded-full h-6 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="mt-2 font-bold text-lg">{percentage}%</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {questions.map((q, idx) => {
                            const isCorrect = answers[idx] === q.answer;
                            return (
                                <div key={idx} className={`p-6 border rounded-xl relative overflow-hidden ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="absolute top-4 right-4">
                                        {isCorrect ? <FaCheckCircle className="text-green-500 w-6 h-6" /> : <FaTimesCircle className="text-red-500 w-6 h-6" />}
                                    </div>
                                    <p className='font-semibold text-gray-800 pr-8'>{idx + 1}. {q.question}</p>
                                    <div className="mt-4 space-y-1">
                                        <p className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <span className="font-semibold">Your Answer:</span> {answers[idx] || 'Skipped'}
                                        </p>
                                        {!isCorrect && (
                                            <p className='text-sm p-2 rounded bg-green-100 text-green-800'>
                                                <span className="font-semibold">Correct Answer:</span> {q.answer}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-12 text-center">
                        <button className='px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition transform hover:-translate-y-1' onClick={() => router.back()}>
                            Back to Course content
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className='min-h-screen bg-gray-50 p-6 md:p-12 flex flex-col items-center justify-center font-sans'>
            <div className='w-full max-w-3xl'>
                {/* Header */}
                <div className='flex justify-between items-end mb-6'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-800'>Final Quiz</h2>
                        <p className="text-gray-500 text-sm mt-1">Test your knowledge</p>
                    </div>
                    <span className="text-xl font-bold text-primary">{currentQuestionIndex + 1} <span className="text-gray-400 text-base font-normal">/ {questions.length}</span></span>
                </div>

                {/* Progress Bar */}
                <div className='h-3 w-full bg-gray-200 rounded-full mb-8 overflow-hidden'>
                    <div className='bg-primary h-full rounded-full transition-all duration-300 ease-out' style={{ width: `${progress}%` }}></div>
                </div>

                {/* Question Card */}
                <div className='bg-white shadow-xl p-8 rounded-2xl border border-gray-100 relative'>
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>

                    <h3 className='text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-snug'>{q.question}</h3>

                    <div className='space-y-4'>
                        {q.options.map((opt, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleOptionSelect(opt)}
                                className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center
                                    ${selectedOption === opt
                                        ? 'bg-purple-50 border-primary shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                                     ${selectedOption === opt ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-purple-300'}
                                 `}>
                                    {selectedOption === opt && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-base font-medium ${selectedOption === opt ? 'text-primary' : 'text-gray-700'}`}>{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className='flex justify-between mt-10'>
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrev}
                        className='px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className='px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuizPage;
