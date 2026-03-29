package com.impact.rest;

import com.impact.agent.CounselorAgent;
import com.impact.strategy.GuidanceStrategyFactory;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/chat")
public class ChatResource {

    @Inject CounselorAgent counselorAgent;
    @Inject GuidanceStrategyFactory strategyFactory;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.TEXT_PLAIN)
    public String chat(ChatRequest request) {
        String studentContext = strategyFactory
                .getStrategy(request.userType())
                .getSystemPrompt();

        return counselorAgent.chat(studentContext, request.message());
    }
}
