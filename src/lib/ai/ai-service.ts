// AI 서비스 - 실제로는 OpenAI API나 다른 AI 서비스를 사용하지만,
// 여기서는 모의 AI 기능을 구현합니다.

interface Question {
  id: string;
  content: string;
  category: string;
  courseId?: string;
  authorId: string;
}

interface Answer {
  content: string;
  confidence: number; // 0-1 사이의 신뢰도
  sources?: string[]; // 참고 자료
  relatedTopics?: string[]; // 관련 주제
}

interface CourseRecommendation {
  courseId: string;
  title: string;
  description: string;
  score: number; // 추천 점수 (0-1)
  reason: string; // 추천 이유
}

interface LearningPath {
  title: string;
  description: string;
  courses: {
    courseId: string;
    title: string;
    order: number;
    estimatedWeeks: number;
  }[];
}

export class AIService {
  private knowledgeBase: Map<string, string[]>;
  private courseKeywords: Map<string, string[]>;
  private commonAnswers: Map<string, Answer>;

  constructor() {
    this.knowledgeBase = new Map();
    this.courseKeywords = new Map();
    this.commonAnswers = new Map();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // 기본 지식 베이스 설정 (실제로는 외부 API나 데이터베이스에서 로드)
    this.knowledgeBase.set('react', [
      'React는 Facebook에서 개발한 JavaScript 라이브러리입니다.',
      'JSX를 사용하여 컴포넌트를 작성할 수 있습니다.',
      'useState와 useEffect는 가장 기본적인 React Hooks입니다.',
      'Virtual DOM을 사용하여 성능을 최적화합니다.',
    ]);

    this.knowledgeBase.set('nextjs', [
      'Next.js는 React 기반의 풀스택 프레임워크입니다.',
      'Server-Side Rendering(SSR)을 지원합니다.',
      'App Router와 Pages Router 두 가지 방식을 제공합니다.',
      'API Routes를 통해 백엔드 API를 구현할 수 있습니다.',
    ]);

    this.knowledgeBase.set('typescript', [
      'TypeScript는 JavaScript에 정적 타입을 추가한 언어입니다.',
      'interface와 type을 사용하여 타입을 정의할 수 있습니다.',
      'Generic을 사용하여 재사용 가능한 컴포넌트를 만들 수 있습니다.',
      '컴파일 시점에 에러를 잡아낼 수 있어 개발 효율성이 높습니다.',
    ]);

    this.knowledgeBase.set('javascript', [
      'JavaScript는 웹 개발의 핵심 언어입니다.',
      'ES6+에서 화살표 함수, 구조 분해 할당 등이 추가되었습니다.',
      'Promise와 async/await으로 비동기 처리를 할 수 있습니다.',
      'DOM 조작과 이벤트 처리가 가능합니다.',
    ]);

    // 강의별 키워드 설정
    this.courseKeywords.set('react-course', ['react', 'jsx', 'component', 'hooks', 'useState', 'useEffect']);
    this.courseKeywords.set('nextjs-course', ['nextjs', 'ssr', 'api routes', 'routing', 'app router']);
    this.courseKeywords.set('typescript-course', ['typescript', 'interface', 'type', 'generic', 'static typing']);

    // 자주 묻는 질문과 답변
    this.commonAnswers.set('react 시작', {
      content: 'React를 시작하려면 먼저 Node.js를 설치하고, create-react-app을 사용하여 새 프로젝트를 생성하세요. `npx create-react-app my-app` 명령어를 사용하면 됩니다.',
      confidence: 0.9,
      sources: ['React 공식 문서', 'Getting Started Guide'],
      relatedTopics: ['Node.js 설치', 'npm', 'JSX 기초']
    });

    this.commonAnswers.set('에러 해결', {
      content: '에러가 발생하면 먼저 콘솔 로그를 확인하고, 에러 메시지를 자세히 읽어보세요. 대부분의 에러는 타입 불일치나 import 오류에서 발생합니다.',
      confidence: 0.8,
      sources: ['디버깅 가이드', 'Chrome DevTools 사용법'],
      relatedTopics: ['디버깅', 'Chrome DevTools', '타입 체크']
    });
  }

  // 질문 카테고리 분류
  categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('react') || lowerQuestion.includes('컴포넌트') || lowerQuestion.includes('jsx')) {
      return 'react';
    }
    if (lowerQuestion.includes('next') || lowerQuestion.includes('ssr') || lowerQuestion.includes('라우팅')) {
      return 'nextjs';
    }
    if (lowerQuestion.includes('typescript') || lowerQuestion.includes('타입') || lowerQuestion.includes('interface')) {
      return 'typescript';
    }
    if (lowerQuestion.includes('javascript') || lowerQuestion.includes('js') || lowerQuestion.includes('함수')) {
      return 'javascript';
    }
    if (lowerQuestion.includes('에러') || lowerQuestion.includes('오류') || lowerQuestion.includes('bug')) {
      return 'debugging';
    }
    if (lowerQuestion.includes('시작') || lowerQuestion.includes('설치') || lowerQuestion.includes('초기')) {
      return 'getting-started';
    }
    if (lowerQuestion.includes('배포') || lowerQuestion.includes('deploy') || lowerQuestion.includes('호스팅')) {
      return 'deployment';
    }

    return 'general';
  }

  // 자동 답변 생성
  generateAutoAnswer(question: string, category: string): Answer | null {
    const lowerQuestion = question.toLowerCase();

    // 정확한 매칭 먼저 확인
    for (const [key, answer] of this.commonAnswers) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }

    // 카테고리별 지식 베이스에서 답변 생성
    const knowledge = this.knowledgeBase.get(category);
    if (knowledge && knowledge.length > 0) {
      // 간단한 키워드 매칭으로 가장 관련있는 답변 선택
      let bestMatch = knowledge[0];
      let maxScore = 0;

      for (const info of knowledge) {
        const infoLower = info.toLowerCase();
        let score = 0;
        
        // 질문의 키워드와 지식의 매칭도 계산
        const questionWords = lowerQuestion.split(' ');
        for (const word of questionWords) {
          if (word.length > 2 && infoLower.includes(word)) {
            score += 1;
          }
        }

        if (score > maxScore) {
          maxScore = score;
          bestMatch = info;
        }
      }

      if (maxScore > 0) {
        return {
          content: bestMatch + '\n\n더 자세한 내용은 해당 강의를 참고하시거나 추가 질문을 남겨주세요.',
          confidence: Math.min(0.8, maxScore * 0.2),
          sources: [`${category} 기초 지식`],
          relatedTopics: this.courseKeywords.get(`${category}-course`) || []
        };
      }
    }

    // 일반적인 응답
    return {
      content: '죄송하지만 이 질문에 대한 정확한 답변을 찾지 못했습니다. 강사님이나 다른 학생들의 답변을 기다려주세요. 더 구체적인 질문을 작성해주시면 더 정확한 답변을 받을 수 있습니다.',
      confidence: 0.3,
      sources: [],
      relatedTopics: ['질문 작성 팁', '커뮤니티 활용법']
    };
  }

  // 학습자 기반 강의 추천
  recommendCourses(
    userId: string,
    completedCourses: string[] = [],
    interests: string[] = [],
    currentLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): CourseRecommendation[] {
    const recommendations: CourseRecommendation[] = [];

    // 모의 강의 데이터
    const availableCourses = [
      {
        id: 'react-basics',
        title: 'React 기초부터 실전까지',
        description: 'React의 기본 개념부터 실무에서 사용하는 패턴까지 학습합니다.',
        category: 'react',
        level: 'beginner',
        prerequisites: ['javascript'],
      },
      {
        id: 'nextjs-master',
        title: 'Next.js 마스터클래스',
        description: 'Next.js를 사용한 풀스택 웹 개발을 마스터합니다.',
        category: 'nextjs',
        level: 'intermediate',
        prerequisites: ['react'],
      },
      {
        id: 'typescript-guide',
        title: 'TypeScript 완벽 가이드',
        description: 'JavaScript에서 TypeScript로 안전하게 전환하는 방법을 학습합니다.',
        category: 'typescript',
        level: 'intermediate',
        prerequisites: ['javascript'],
      },
      {
        id: 'advanced-react',
        title: '고급 React 패턴',
        description: 'React의 고급 패턴과 성능 최적화 기법을 학습합니다.',
        category: 'react',
        level: 'advanced',
        prerequisites: ['react'],
      },
      {
        id: 'nodejs-backend',
        title: 'Node.js 백엔드 개발',
        description: 'Node.js를 사용한 백엔드 API 개발을 학습합니다.',
        category: 'nodejs',
        level: 'intermediate',
        prerequisites: ['javascript'],
      }
    ];

    for (const course of availableCourses) {
      // 이미 완료한 강의는 제외
      if (completedCourses.includes(course.id)) {
        continue;
      }

      let score = 0;
      let reason = '';

      // 레벨 매칭
      if (course.level === currentLevel) {
        score += 0.4;
        reason += `현재 수준(${currentLevel})에 적합합니다. `;
      } else if (
        (currentLevel === 'beginner' && course.level === 'intermediate') ||
        (currentLevel === 'intermediate' && course.level === 'advanced')
      ) {
        score += 0.3;
        reason += `다음 단계 학습에 좋습니다. `;
      }

      // 관심사 매칭
      for (const interest of interests) {
        if (course.category.includes(interest.toLowerCase()) || course.title.toLowerCase().includes(interest.toLowerCase())) {
          score += 0.3;
          reason += `관심 분야(${interest})와 일치합니다. `;
          break;
        }
      }

      // 선수 과목 완료 여부
      const prerequisitesMet = course.prerequisites.every(prereq => 
        completedCourses.some(completed => completed.includes(prereq))
      );

      if (prerequisitesMet) {
        score += 0.2;
        reason += '선수 과목을 완료했습니다. ';
      } else if (course.prerequisites.length === 0) {
        score += 0.2;
        reason += '선수 과목이 없어 바로 시작할 수 있습니다. ';
      }

      // 학습 경로 연관성
      if (completedCourses.includes('javascript') && course.category === 'react') {
        score += 0.2;
        reason += 'JavaScript 기초를 바탕으로 자연스럽게 이어집니다. ';
      }
      if (completedCourses.includes('react-basics') && course.category === 'nextjs') {
        score += 0.3;
        reason += 'React 지식을 확장하는 좋은 다음 단계입니다. ';
      }

      if (score > 0.3) { // 최소 점수 이상인 경우만 추천
        recommendations.push({
          courseId: course.id,
          title: course.title,
          description: course.description,
          score,
          reason: reason.trim()
        });
      }
    }

    // 점수 순으로 정렬하여 상위 5개만 반환
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  // 개인화된 학습 경로 생성
  generateLearningPath(
    userGoal: string,
    currentLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    timeframe: number = 6 // 개월
  ): LearningPath {
    const goal = userGoal.toLowerCase();

    if (goal.includes('프론트엔드') || goal.includes('frontend') || goal.includes('웹 개발')) {
      return {
        title: '프론트엔드 개발자 완성 과정',
        description: '현대적인 프론트엔드 개발에 필요한 모든 기술을 단계별로 학습합니다.',
        courses: [
          { courseId: 'html-css-basics', title: 'HTML/CSS 기초', order: 1, estimatedWeeks: 3 },
          { courseId: 'javascript-fundamentals', title: 'JavaScript 핵심', order: 2, estimatedWeeks: 4 },
          { courseId: 'react-basics', title: 'React 기초부터 실전까지', order: 3, estimatedWeeks: 6 },
          { courseId: 'typescript-guide', title: 'TypeScript 완벽 가이드', order: 4, estimatedWeeks: 4 },
          { courseId: 'nextjs-master', title: 'Next.js 마스터클래스', order: 5, estimatedWeeks: 5 },
          { courseId: 'advanced-react', title: '고급 React 패턴', order: 6, estimatedWeeks: 4 }
        ]
      };
    }

    if (goal.includes('백엔드') || goal.includes('backend') || goal.includes('서버')) {
      return {
        title: '백엔드 개발자 완성 과정',
        description: '확장 가능한 백엔드 시스템을 구축하는 데 필요한 기술을 학습합니다.',
        courses: [
          { courseId: 'javascript-fundamentals', title: 'JavaScript 핵심', order: 1, estimatedWeeks: 4 },
          { courseId: 'nodejs-basics', title: 'Node.js 기초', order: 2, estimatedWeeks: 4 },
          { courseId: 'database-design', title: '데이터베이스 설계', order: 3, estimatedWeeks: 4 },
          { courseId: 'api-development', title: 'RESTful API 개발', order: 4, estimatedWeeks: 5 },
          { courseId: 'microservices', title: '마이크로서비스 아키텍처', order: 5, estimatedWeeks: 6 },
          { courseId: 'devops-basics', title: 'DevOps 기초', order: 6, estimatedWeeks: 3 }
        ]
      };
    }

    if (goal.includes('풀스택') || goal.includes('fullstack') || goal.includes('전체')) {
      return {
        title: '풀스택 개발자 완성 과정',
        description: '프론트엔드부터 백엔드까지 모든 영역을 아우르는 종합 과정입니다.',
        courses: [
          { courseId: 'web-fundamentals', title: '웹 개발 기초', order: 1, estimatedWeeks: 4 },
          { courseId: 'javascript-fundamentals', title: 'JavaScript 핵심', order: 2, estimatedWeeks: 4 },
          { courseId: 'react-basics', title: 'React 기초부터 실전까지', order: 3, estimatedWeeks: 6 },
          { courseId: 'nodejs-backend', title: 'Node.js 백엔드 개발', order: 4, estimatedWeeks: 5 },
          { courseId: 'database-management', title: '데이터베이스 관리', order: 5, estimatedWeeks: 4 },
          { courseId: 'deployment-devops', title: '배포 및 DevOps', order: 6, estimatedWeeks: 3 }
        ]
      };
    }

    // 기본 학습 경로
    return {
      title: '프로그래밍 입문 과정',
      description: '프로그래밍의 기초부터 실무 활용까지 단계별로 학습합니다.',
      courses: [
        { courseId: 'programming-basics', title: '프로그래밍 기초', order: 1, estimatedWeeks: 4 },
        { courseId: 'javascript-fundamentals', title: 'JavaScript 핵심', order: 2, estimatedWeeks: 4 },
        { courseId: 'web-development', title: '웹 개발 입문', order: 3, estimatedWeeks: 6 },
        { courseId: 'project-based-learning', title: '프로젝트 기반 학습', order: 4, estimatedWeeks: 8 }
      ]
    };
  }

  // 질문의 난이도 평가
  assessQuestionDifficulty(question: string, context?: string): 'easy' | 'medium' | 'hard' {
    const lowerQuestion = question.toLowerCase();
    
    // 고급 키워드
    const advancedKeywords = [
      'optimization', 'performance', 'architecture', 'design pattern',
      'scalability', 'microservice', 'advanced', 'complex',
      '최적화', '성능', '아키텍처', '설계', '확장성', '고급', '복잡한'
    ];

    // 중급 키워드
    const intermediateKeywords = [
      'api', 'state management', 'routing', 'hooks', 'async',
      'database', 'authentication', 'testing',
      '상태관리', '라우팅', '비동기', '데이터베이스', '인증', '테스트'
    ];

    // 기초 키워드
    const basicKeywords = [
      'what is', 'how to', 'basic', 'simple', 'start', 'begin',
      '무엇인가요', '어떻게', '기초', '간단한', '시작', '처음'
    ];

    let advancedScore = 0;
    let intermediateScore = 0;
    let basicScore = 0;

    for (const keyword of advancedKeywords) {
      if (lowerQuestion.includes(keyword)) advancedScore++;
    }

    for (const keyword of intermediateKeywords) {
      if (lowerQuestion.includes(keyword)) intermediateScore++;
    }

    for (const keyword of basicKeywords) {
      if (lowerQuestion.includes(keyword)) basicScore++;
    }

    // 질문 길이도 고려 (긴 질문일수록 복잡할 가능성)
    const wordCount = question.split(' ').length;
    if (wordCount > 20) advancedScore++;
    else if (wordCount > 10) intermediateScore++;
    else basicScore++;

    if (advancedScore > intermediateScore && advancedScore > basicScore) {
      return 'hard';
    } else if (intermediateScore > basicScore) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  // 학습 진도 기반 맞춤 컨텐츠 추천
  getPersonalizedContent(
    userId: string,
    currentProgress: number, // 0-1 사이의 진도율
    weakAreas: string[] = [],
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' = 'visual'
  ) {
    const recommendations = [];

    // 진도에 따른 추천
    if (currentProgress < 0.3) {
      recommendations.push({
        type: 'review',
        title: '기초 개념 복습',
        description: '현재까지 학습한 내용을 다시 한번 점검해보세요.',
        priority: 'high'
      });
    } else if (currentProgress < 0.7) {
      recommendations.push({
        type: 'practice',
        title: '실습 프로젝트',
        description: '배운 내용을 실제 프로젝트에 적용해보세요.',
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'advanced',
        title: '심화 학습',
        description: '고급 주제와 실무 패턴을 학습할 준비가 되었습니다.',
        priority: 'medium'
      });
    }

    // 약점 영역 보완
    for (const weakArea of weakAreas) {
      recommendations.push({
        type: 'supplement',
        title: `${weakArea} 보강 학습`,
        description: `${weakArea} 영역의 이해도를 높이기 위한 추가 자료입니다.`,
        priority: 'high'
      });
    }

    // 학습 스타일에 따른 추천
    switch (learningStyle) {
      case 'visual':
        recommendations.push({
          type: 'content',
          title: '인포그래픽과 다이어그램',
          description: '시각적 자료로 개념을 더 쉽게 이해해보세요.',
          priority: 'low'
        });
        break;
      case 'auditory':
        recommendations.push({
          type: 'content',
          title: '강의 동영상과 팟캐스트',
          description: '음성 자료로 학습 효과를 높여보세요.',
          priority: 'low'
        });
        break;
      case 'kinesthetic':
        recommendations.push({
          type: 'content',
          title: '실습과 코딩 연습',
          description: '직접 코드를 작성하며 체험해보세요.',
          priority: 'low'
        });
        break;
    }

    return recommendations;
  }
}

// 싱글톤 인스턴스 export
export const aiService = new AIService(); 