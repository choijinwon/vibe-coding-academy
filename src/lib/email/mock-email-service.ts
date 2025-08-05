// 모의 이메일 서비스
// 실제 프로덕션에서는 SendGrid, Nodemailer, AWS SES 등을 사용

interface EmailRecipient {
  email: string;
  name: string;
}

interface AnnouncementEmail {
  title: string;
  content: string;
  authorName: string;
  courseName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
}

class MockEmailService {
  private emailLogs: Array<{
    id: string;
    timestamp: Date;
    recipients: EmailRecipient[];
    subject: string;
    content: string;
    status: 'sent' | 'failed';
  }> = [];

  async sendAnnouncementEmail(
    announcement: AnnouncementEmail,
    recipients: EmailRecipient[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // 이메일 전송 시뮬레이션 (실제로는 전송하지 않음)
      console.log('📧 이메일 알림 전송 시뮬레이션');
      console.log('수신자:', recipients.length, '명');
      console.log('제목:', this.generateEmailSubject(announcement));
      console.log('내용 미리보기:', announcement.content.substring(0, 100) + '...');

      // 모의 전송 지연 (네트워크 요청 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 500));

      // 95% 확률로 성공 (실제 이메일 서비스의 실패율 시뮬레이션)
      const isSuccess = Math.random() > 0.05;

      const emailLog = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        recipients,
        subject: this.generateEmailSubject(announcement),
        content: this.generateEmailContent(announcement),
        status: isSuccess ? 'sent' as const : 'failed' as const,
      };

      this.emailLogs.push(emailLog);

      if (isSuccess) {
        console.log('✅ 이메일 전송 성공 (모의)');
        return {
          success: true,
          messageId: emailLog.id
        };
      } else {
        console.log('❌ 이메일 전송 실패 (모의)');
        return {
          success: false,
          error: '이메일 서비스 일시적 오류 (모의)'
        };
      }
    } catch (error) {
      console.error('이메일 전송 오류:', error);
      return {
        success: false,
        error: '이메일 전송 중 오류가 발생했습니다.'
      };
    }
  }

  private generateEmailSubject(announcement: AnnouncementEmail): string {
    const priorityPrefix = announcement.priority === 'urgent' ? '[긴급] ' : 
                          announcement.priority === 'high' ? '[중요] ' : '';
    
    const coursePrefix = announcement.courseName ? `[${announcement.courseName}] ` : '[바이브코딩 아카데미] ';
    
    return `${priorityPrefix}${coursePrefix}${announcement.title}`;
  }

  private generateEmailContent(announcement: AnnouncementEmail): string {
    const priorityEmoji = {
      urgent: '🚨',
      high: '⚠️',
      normal: '📢',
      low: '💬'
    };

    const categoryEmoji = {
      general: '📢',
      academic: '📚',
      event: '🎉',
      urgent: '🚨',
      maintenance: '🔧'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${announcement.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }
        .footer { background: #6c757d; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; }
        .priority-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .urgent { background: #dc3545; color: white; }
        .high { background: #fd7e14; color: white; }
        .normal { background: #17a2b8; color: white; }
        .low { background: #6c757d; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${priorityEmoji[announcement.priority]} ${announcement.title}</h1>
        ${announcement.courseName ? `<p>강의: ${announcement.courseName}</p>` : '<p>바이브코딩 아카데미 공지사항</p>'}
    </div>
    
    <div class="content">
        <div class="priority-badge ${announcement.priority}">${categoryEmoji[announcement.category as keyof typeof categoryEmoji]} ${announcement.priority.toUpperCase()}</div>
        
        <div style="white-space: pre-wrap; margin: 20px 0;">
${announcement.content}
        </div>
        
        <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            작성자: ${announcement.authorName}<br>
            작성일: ${new Date().toLocaleString('ko-KR')}
        </p>
    </div>
    
    <div class="footer">
        <p>바이브코딩 아카데미 | <a href="mailto:support@vibecoding.com" style="color: #fff;">문의하기</a></p>
        <p style="font-size: 12px; margin: 5px 0 0 0;">이 메일은 공지사항 알림 서비스에서 자동으로 발송되었습니다.</p>
    </div>
</body>
</html>
    `.trim();
  }

  // 이메일 전송 로그 조회 (관리자용)
  getEmailLogs(limit: number = 50) {
    return this.emailLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // 이메일 전송 통계
  getEmailStats() {
    const total = this.emailLogs.length;
    const sent = this.emailLogs.filter(log => log.status === 'sent').length;
    const failed = this.emailLogs.filter(log => log.status === 'failed').length;

    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0
    };
  }
}

// 싱글톤 인스턴스
export const mockEmailService = new MockEmailService();

// 사용자 목록 조회 함수 (모의 데이터)
export async function getAnnouncementRecipients(
  courseId?: string
): Promise<EmailRecipient[]> {
  // 실제로는 데이터베이스에서 사용자 목록을 조회
  const mockUsers: EmailRecipient[] = [
    { email: 'student1@example.com', name: '김학생' },
    { email: 'student2@example.com', name: '이학생' },
    { email: 'student3@example.com', name: '박학생' },
    { email: 'student4@example.com', name: '최학생' },
    { email: 'student5@example.com', name: '정학생' },
  ];

  if (courseId) {
    // 특정 강의 수강생만 반환
    return mockUsers.slice(0, 3); // 모의로 3명만
  } else {
    // 전체 학생 반환
    return mockUsers;
  }
}

export default mockEmailService; 