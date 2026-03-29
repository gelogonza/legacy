package com.impact.rest;

import com.impact.model.UserType;

public record ChatRequest(UserType userType, String message) {}
