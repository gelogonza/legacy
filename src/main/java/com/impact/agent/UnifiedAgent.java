package com.impact.agent;

import com.impact.service.DeadlineService;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService(tools = DeadlineService.class)
public interface UnifiedAgent {

    String chat(@SystemMessage String systemPrompt, @UserMessage String userMessage);
}
