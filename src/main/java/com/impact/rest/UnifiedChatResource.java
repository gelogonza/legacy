package com.impact.rest;

import com.impact.agent.UnifiedAgent;
import com.impact.service.PromptAssembler;
import com.impact.service.RecommendationExtractor;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/chat")
public class UnifiedChatResource {

    @Inject UnifiedAgent unifiedAgent;
    @Inject PromptAssembler promptAssembler;
    @Inject RecommendationExtractor recommendationExtractor;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public UnifiedChatResponse chat(UnifiedChatRequest request) {
        String systemPrompt = promptAssembler.assemble(request);
        String userMessage  = buildUserMessage(request);

        String text = unifiedAgent.chat(systemPrompt, userMessage);
        List<UnifiedChatResponse.Recommendation> recommendations = recommendationExtractor.extract(text);

        return new UnifiedChatResponse(text, recommendations);
    }

    private String buildUserMessage(UnifiedChatRequest request) {
        List<UnifiedChatRequest.Message> history = request.history();
        if (history == null || history.isEmpty()) {
            return request.message();
        }

        StringBuilder sb = new StringBuilder();
        for (UnifiedChatRequest.Message msg : history) {
            String label = "user".equalsIgnoreCase(msg.role()) ? "User" : "Assistant";
            sb.append(label).append(": ").append(msg.content()).append("\n\n");
        }
        sb.append("User: ").append(request.message());
        return sb.toString();
    }
}
