import React, { useState } from 'react';
import './AdmissionForm.css';

export function AdmissionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultMsg, setResultMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data: Record<string, any> = Object.fromEntries(formData.entries());

        data.reason = formData.getAll('reason');
        data.priority = formData.getAll('priority');

        setIsSubmitting(true);
        setResultMsg(null);

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (response.ok) {
                setResultMsg({ text: "성공적으로 제출되었습니다. 감사합니다.", type: 'success' });
                form.reset();
            } else {
                throw new Error(result.error || '제출에 실패했습니다.');
            }
        } catch (err: any) {
            setResultMsg({ text: "❌ 오류가 발생했습니다: " + err.message + " 다시 시도해주세요.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admission-container antialiased">
            <div className="page-container neu-flat my-0 sm:my-10">
                {/* Header / Logo Section */}
                <div className="flex flex-col items-center text-center mb-10 border-b border-gray-300/50 pb-8">
                    <div className="neu-flat p-4 mb-4 rounded-2xl inline-block">
                        <img src="/logo.png" alt="Willgrow Logo" className="h-12 sm:h-16 object-contain" />
                    </div>
                    <h2 className="text-[0.6rem] sm:text-xs font-bold text-gray-500 tracking-[0.25em] uppercase mb-3">
                        Willgrow Language Institute
                    </h2>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-800">입학상담 온라인</h1>
                    <p className="mt-4 text-xs sm:text-sm text-gray-500 max-w-sm px-4 leading-relaxed">
                        정확한 진단과 올바른 학습 방향 설정을 위해<br />상세한 작성을 부탁드립니다.
                    </p>
                </div>

                <form onSubmit={submitForm} className="space-y-8 sm:space-y-10">
                    <div className="flex justify-end pr-1 -mb-4 sm:-mb-6">
                        <span className="text-[0.65rem] sm:text-xs text-gray-400 font-medium">
                            <span className="text-red-500">*</span> 표시 항목은 필수입력 사항입니다.
                        </span>
                    </div>

                    {/* 1. 학생 및 보호자 기본 정보 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-800 flex items-center">
                            <span className="w-1.5 h-6 bg-[#4d76bf] rounded-full mr-3"></span> 1. 학생 및 보호자 기본 정보
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">
                                    학생 성명 <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <div className="flex flex-1 flex-wrap items-center gap-2 w-full">
                                    <input type="text" name="student_name" required className="neu-pressed flex-1 p-3 text-sm min-w-[120px]" placeholder="이름 입력" />
                                    <div className="flex items-center gap-3 shrink-0 px-2">
                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap">
                                            <input type="radio" name="gender" value="남" required /> 남
                                        </label>
                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap">
                                            <input type="radio" name="gender" value="여" /> 여
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1 text-nowrap">학생 연락처</label>
                                <input type="tel" name="student_phone" className="neu-pressed w-full sm:flex-1 p-3 text-sm" placeholder="010-0000-0000" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">
                                    학교 및 학년 <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <div className="flex flex-1 flex-wrap items-center gap-2 w-full">
                                    <input type="text" name="school_name" required className="neu-pressed flex-[1_1_180px] p-3 text-sm" placeholder="학교명" />
                                    <div className="flex items-center gap-1 shrink-0">
                                        <input type="text" name="grade" required className="neu-pressed w-20 p-3 text-center text-sm" placeholder="학년" />
                                        <span className="text-sm text-gray-500">학년</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">보호자 성명</label>
                                <input type="text" name="parent_name" className="neu-pressed flex-1 p-3 text-sm" placeholder="보호자 성함 입력" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:col-span-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">
                                    보호자 연락처 <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="tel" name="parent_phone" required className="neu-pressed w-full lg:w-1/2 p-3 text-sm" placeholder="010-0000-0000" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:col-span-2">
                                <label className="w-28 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">
                                    거주지 주소 <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="text" name="address" required className="neu-pressed w-full sm:flex-1 p-3 text-sm" placeholder="상세 주소를 입력해 주세요" />
                            </div>
                        </div>
                    </div>

                    {/* 2. 영어 학습 이력 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-800 flex items-center">
                            <span className="w-1.5 h-6 bg-[#4d76bf] rounded-full mr-3"></span> 2. 영어 학습 이력
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                                <label className="w-32 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">이전 학습 형태</label>
                                <input type="text" name="previous_learning" className="neu-pressed w-full sm:flex-1 p-3 text-sm" placeholder="어학원, 공부방, 과외, 독학, 해외 거주 등" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                                <label className="w-32 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">학습 기간</label>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-xs sm:text-sm text-gray-500">처음 시작:</span>
                                        <input type="text" name="first_start" className="neu-pressed w-32 p-3 text-sm" placeholder="예: 7세, 초1" />
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-xs sm:text-sm text-gray-500 ml-1">총 기간:</span>
                                        <input type="number" name="learning_years" className="neu-pressed w-16 p-3 text-center text-sm" placeholder="0" />
                                        <span className="text-xs sm:text-sm text-gray-500">년</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <input type="number" name="learning_months" className="neu-pressed w-16 p-3 text-center text-sm" placeholder="0" />
                                        <span className="text-xs sm:text-sm text-gray-500">개월</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                                <label className="w-32 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">수강했던 학원명</label>
                                <input type="text" name="previous_academy" className="neu-pressed w-full sm:flex-1 p-3 text-sm" placeholder="가장 최근에 다녔던 학원명 입력" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:col-span-2">
                                <label className="w-32 font-semibold text-sm sm:text-base text-gray-600 shrink-0 pl-1">사용 교재/레벨</label>
                                <input type="text" name="previous_book" className="neu-pressed w-full sm:flex-1 p-3 text-sm" placeholder="기억나시는 교재명 및 레벨 입력" />
                            </div>
                        </div>
                    </div>

                    {/* 3. 학원 변경 및 신규 등록 사유 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex items-center">
                            <span className="w-1.5 h-6 bg-[#4d76bf] rounded-full mr-3"></span> 3. 학원 변경 및 신규 등록 사유
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-5 ml-4 sm:ml-5">현재 학습 환경에서 변화를 주고자 하는 가장 큰 이유는 무엇입니까? (중복 선택 가능)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 ml-1 sm:ml-5">
                            {['심화방향', '출력강화', '체계적관리', '동기부여', '내신대비', '환경적요인'].map((reason, idx) => {
                                const labels = [
                                    "더 높은 수준의 심화 학습이 필요해서",
                                    "말하기/쓰기 등 출력 중심 학습을 강화하고 싶어서",
                                    "체계적인 레벨 관리와 커리큘럼을 원해서",
                                    "학습 동기 부여 및 밀착 관리가 필요해서",
                                    "내신 및 입시 대비를 시작하기 위해",
                                    "셔틀버스, 시간표 등 환경적 요인"
                                ];
                                return (
                                    <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                                        <input type="checkbox" name="reason" value={reason} className="mt-0.5" />
                                        <span className="text-sm sm:text-base leading-snug text-gray-700 group-hover:text-gray-900">{labels[idx]}</span>
                                    </label>
                                );
                            })}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:col-span-2 mt-1 sm:mt-0">
                                <label className="flex items-center gap-3 cursor-pointer shrink-0">
                                    <input type="checkbox" id="reason_other_chk" onChange={(e) => { if(e.target.checked) document.getElementById('reason_other_input')?.focus(); }} />
                                    <span className="text-sm sm:text-base text-gray-700">기타:</span>
                                </label>
                                <input type="text" id="reason_other_input" name="reason_other" className="neu-pressed w-full sm:flex-1 p-2.5 text-sm" placeholder="기타 사유를 자유롭게 적어주세요" />
                            </div>
                        </div>
                    </div>

                    {/* 4. 학원 선택 시 최우선 고려사항 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 flex items-center">
                            <span className="w-1.5 h-6 bg-[#4d76bf] rounded-full mr-3"></span> 4. 학원 선택 시 최우선 고려사항
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-5 ml-4 sm:ml-5">
                            학부모님께서 우리 학원을 선택하실 때 가장 중요하게 생각하시는 요소는 무엇입니까?
                            <strong className="text-[#4d76bf] px-2 py-0.5 rounded-md ml-1">(3가지 선택)</strong>
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-6 ml-1 sm:ml-5">
                            {[
                                { val: '밀착관리', bold: '밀착 관리:', desc: '1:1 개별 피드백 및 철저한 과제 관리' },
                                { val: '커리큘럼', bold: '커리큘럼:', desc: '학습 콘텐츠 및 교재의 우수성' },
                                { val: '학생관리', bold: '학생 관리:', desc: '출결, 과제 체크, 정기 상담' },
                                { val: '학습환경', bold: '학습 환경:', desc: '시설의 청결도 및 면학 분위기' },
                                { val: '성적향상', bold: '성적 향상:', desc: '철저한 내신 대비 및 성과 중심 수업' },
                                { val: '소통', bold: '소통:', desc: '학부모님과의 원활한 상담, 유대감' },
                                { val: '접근성', bold: '접근성:', desc: '거리 및 셔틀 운행' },
                                { val: '브랜드인지도', bold: '브랜드 인지도:', desc: '학원의 명성 및 신뢰도' }
                            ].map((item) => (
                                <label key={item.val} className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" name="priority" value={item.val} className="mt-0.5" />
                                    <div className="text-sm sm:text-base leading-snug text-gray-600 group-hover:text-gray-900">
                                        <span className="font-bold text-gray-800">{item.bold}</span> {item.desc}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 5. 자녀의 학습 성향 및 특징 */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 text-gray-800 flex items-center">
                            <span className="w-1.5 h-6 bg-[#4d76bf] rounded-full mr-3"></span> 5. 자녀의 학습 성향 및 특징
                        </h2>
                        <div className="ml-1 sm:ml-5 flex flex-col gap-3">
                            <label className="font-semibold text-sm sm:text-base text-gray-700">장점 및 특징 (예: 단어 암기력이 좋음, 적극적인 참여 등)</label>
                            <textarea name="student_features" className="neu-pressed w-full p-4 h-32 sm:h-40 resize-none text-sm leading-relaxed" placeholder="자녀의 학습적인 장점이나 성향, 또는 선생님이 미리 알아두면 좋은 점을 자유롭게 적어주세요."></textarea>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="pt-6 border-t border-gray-300/30 flex justify-center no-print">
                        <button type="submit" disabled={isSubmitting} className={`neu-btn text-white font-bold text-lg py-4 px-16 flex items-center gap-3 ${isSubmitting ? 'opacity-80' : ''}`}>
                            <span>제출하기</span>
                            {isSubmitting && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* 성공/에러 메시지 */}
                    {resultMsg && (
                        <div className={`text-center mt-4 font-bold rounded-lg p-4 ${resultMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {resultMsg.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
