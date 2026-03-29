package com.impact.strategy;

import com.impact.model.UserType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GuidanceStrategyFactory {

    @Inject GeneralStrategy generalStrategy;
    @Inject HighSchoolStrategy highSchoolStrategy;
    @Inject CollegeStudentStrategy collegeStudentStrategy;
    @Inject ReturningStudentStrategy returningStudentStrategy;

    public GuidanceStrategy getStrategy(UserType type) {
        return switch (type) {
            case GENERAL   -> generalStrategy;
            case HIGH_SCHOOL -> highSchoolStrategy;
            case COLLEGE   -> collegeStudentStrategy;
            case RETURNING -> returningStudentStrategy;
        };
    }
}
