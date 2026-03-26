export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // 필수 항목 백엔드 검증 (거주지 주소 포함)
    if (!data.student_name || !data.school_name || !data.grade || !data.parent_phone || !data.address) {
      const missingFields = [];
      if (!data.student_name) missingFields.push("학생 성명");
      if (!data.school_name) missingFields.push("학교명");
      if (!data.grade) missingFields.push("학년");
      if (!data.parent_phone) missingFields.push("보호자 연락처");
      if (!data.address) missingFields.push("거주지 주소");

      return new Response(JSON.stringify({ 
        error: `다음 필수 항목을 입력해주세요: ${missingFields.join(', ')}` 
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 환경 변수에서 Notion Key 및 Database ID 가져오기
    const NOTION_API_KEY = env.NOTION_API_KEY;
    const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID;

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
      return new Response(JSON.stringify({ error: "Server Configuration Error (Notion Key/ID missing)" }), { status: 500 });
    }

    // 학생 정보 바탕으로 본문 구성
    const pageContentBlocks = [
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "📋 기본 정보" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 학생 성명: ${data.student_name} (${data.gender})` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 학생 연락처: ${data.student_phone || "미입력"}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 학교 및 학년: ${data.school_name} ${data.grade}학년` } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "👨‍👩‍👧‍👦 보호자 정보" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 보호자 성명: ${data.parent_name}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 보호자 연락처: ${data.parent_phone}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 거주지 주소: ${data.address || "미입력"}` } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "📚 영어 학습 이력" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 이전 학습 형태: ${data.previous_learning || "-"}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 처음 시작 시기: ${data.first_start || "-"}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 총 학습 기간: ${data.learning_years || "0"}년 ${data.learning_months || "0"}개월` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 이전 수강 학원: ${data.previous_academy || "-"}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 사용 교재/레벨: ${data.previous_book || "-"}` } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "🎯 상담 목적 및 고려사항" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 학원 변경/등록 사유: ${(data.reason || []).join(', ')} / 기타: ${data.reason_other || "-"}` } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: `- 최우선 고려사항 (3가지): ${(data.priority || []).join(', ')}` } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "✨ 자녀의 학습 성향 및 특징" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: data.student_features || "(작성되지 않음)" } }] }
      }
    ];

    // Notion 데이터베이스 속성(컬럼) 매핑
    const properties = {
      // 1. 학생 기본 정보
      "이름": { 
        title: [{ text: { content: data.student_name } }] 
      },
      "성별": { 
        select: { name: data.gender } 
      },
      "학생 연락처": { 
        phone_number: data.student_phone || "" 
      },
      "학교": { 
        rich_text: [{ text: { content: data.school_name || "" } }] 
      },
      "학년": { 
        rich_text: [{ text: { content: data.grade || "" } }] 
      },
      // 2. 보호자 정보
      "학부모 성함": { 
        rich_text: [{ text: { content: data.parent_name || "" } }] 
      },
      "보호자 연락처": { 
        phone_number: data.parent_phone || "" 
      },
      "주소": { 
        rich_text: [{ text: { content: data.address || "" } }] 
      },
      // 3. 영어 학습 이력
      "이전 학습 형태": { 
        rich_text: [{ text: { content: data.previous_learning || "" } }] 
      },
      "처음 시작 시기": { 
        rich_text: [{ text: { content: data.first_start || "" } }] 
      },
      "학습 기간": { 
        rich_text: [{ text: { content: `${data.learning_years || "0"}년 ${data.learning_months || "0"}개월` } }] 
      },
      "이전 학원명": { 
        rich_text: [{ text: { content: data.previous_academy || "" } }] 
      },
      "사용 교재": { 
        rich_text: [{ text: { content: data.previous_book || "" } }] 
      },
      // 4. 상담 목적 및 고려사항
      "등록 사유": { 
        multi_select: (data.reason || []).map(r => ({ name: r })) 
      },
      "기타 사유": { 
        rich_text: [{ text: { content: data.reason_other || "" } }] 
      },
      "최우선 고려사항": { 
        multi_select: (data.priority || []).map(p => ({ name: p })) 
      },
      "특이사항": { 
        rich_text: [{ text: { content: data.student_features || "" } }] 
      }
    };

    // Notion API 요청
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: env.NOTION_DATABASE_ID },
        properties: properties,
        children: pageContentBlocks // 본문에도 백업으로 남겨둠
      })
    });

    const notionResult = await notionResponse.json();

    if (!notionResponse.ok) {
        // Notion 설정이 'Name'으로 되어 있을 경우 재시도
        if (notionResult.code === "validation_error" && notionResult.message.includes("Could not find property")) {
            const retryProperties = { ...properties };
            delete retryProperties["이름"];
            retryProperties["Name"] = { 
                title: [{ text: { content: data.student_name } }] 
            };

            const retryResponse = await fetch("https://api.notion.com/v1/pages", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${env.NOTION_API_KEY}`,
                  "Content-Type": "application/json",
                  "Notion-Version": "2022-06-28"
                },
                body: JSON.stringify({
                  parent: { database_id: env.NOTION_DATABASE_ID },
                  properties: retryProperties,
                  children: pageContentBlocks
                })
            });
            const retryResult = await retryResponse.json();
            if(!retryResponse.ok) {
                return new Response(JSON.stringify({ error: "Notion API Error: 컬럼 이름이 노션 데이터베이스와 일치하지 않습니다. " + JSON.stringify(retryResult) }), { status: 500 });
            }
        } else {
            return new Response(JSON.stringify({ error: "Notion API Error: " + JSON.stringify(notionResult) }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ success: true, message: "Successfully submitted" }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.stack || err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
