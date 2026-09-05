package com.raajwarasa.dto;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalArtifacts,
        long featuredArtifacts,
        long newEnquiries,
        long contacted,
        long followUps,
        long resolved,
        List<Map<String, Object>> recentEnquiries,
        Map<String, Long> enquiriesByStatus,
        List<Map<String, Object>> enquiriesBySource,
        List<Map<String, Object>> enquiriesOverTime,
        long totalJournalPublished
) {
}