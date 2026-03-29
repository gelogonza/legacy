package com.impact.strategy;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GeneralStrategy extends BaseGuidanceStrategy {

    @Override
    protected String getSpecializedPrompt() {
        return "";
    }
}
