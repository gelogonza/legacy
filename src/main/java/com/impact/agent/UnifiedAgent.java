package com.impact.agent;

import com.impact.service.DeadlineService;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V; // Added this import
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService(tools = DeadlineService.class)
public interface UnifiedAgent {

    @SystemMessage("{{systemPrompt}}") // Move it here as a template
    String chat(@V("systemPrompt") String systemPrompt, @UserMessage String userMessage);
}
