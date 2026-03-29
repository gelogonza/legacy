package com.impact.rest;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

@Provider
public class CorsFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext request, ContainerResponseContext response) {
        String origin = request.getHeaderString("Origin");
        if (origin != null && (
            origin.equals("http://localhost:3000") ||
            origin.equals("http://localhost:5173") ||
            origin.equals("https://legacy-cyan.vercel.app")
        )) {
            response.getHeaders().putSingle("Access-Control-Allow-Origin", origin);
            response.getHeaders().putSingle("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.getHeaders().putSingle("Access-Control-Allow-Headers", "Content-Type, Accept");
            response.getHeaders().putSingle("Access-Control-Max-Age", "86400");
        }
    }
}
