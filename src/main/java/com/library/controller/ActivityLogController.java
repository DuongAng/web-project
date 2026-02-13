package com.library.controller;

import com.library.dto.response.ActivityLogDTO;
import com.library.dto.response.ApiResponse;
import com.library.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới xem được. nói chung cái này là để giới hạn quyền á
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogDTO>>> getAllLogs() {
        List<ActivityLogDTO> logs = activityLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ActivityLogDTO>>> getLogsByUser(@PathVariable Long userId) {
        List<ActivityLogDTO> logs = activityLogService.getLogsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ActivityLogDTO>>> searchLogs(@RequestParam String keyword) {
        List<ActivityLogDTO> logs = activityLogService.searchLogs(keyword);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable Long id) {
        activityLogService.deleteLog(id);
        return ResponseEntity.ok(ApiResponse.success("Logs have been deleted.", null));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllLogs() {
        activityLogService.deleteAllLogs();
        return ResponseEntity.ok(ApiResponse.success("All logs have been deleted.", null));
    }
}