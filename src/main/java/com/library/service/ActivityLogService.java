package com.library.service;

import com.library.dto.response.ActivityLogDTO;
import com.library.entity.ActivityLog;
import com.library.entity.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    /*
     * Ghi log hoạt động
     */
    public void log(Long userId, String action) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setUsername(user.getUsername());
            log.setUserRole(user.getRole().getName());
            log.setAction(action);
            activityLogRepository.save(log);
        }
    }

    /*
     * Ghi log với User object
     */
    public void log(User user, String action) {
        if (user != null) {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setUsername(user.getUsername());
            log.setUserRole(user.getRole().getName());
            log.setAction(action);
            activityLogRepository.save(log);
        }
    }

    /*
     * Lấy tất cả logs (mới nhất trước)
     */
    public List<ActivityLogDTO> getAllLogs() {
        return activityLogRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"))
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /*
     * Lấy logs theo user
     */
    public List<ActivityLogDTO> getLogsByUser(Long userId) {
        return activityLogRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /*
     * Tìm logs theo action
     */
    public List<ActivityLogDTO> searchLogs(String keyword) {
        return activityLogRepository.findByActionContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /*
     * Xóa log theo ID
     */
    @Transactional
    public void deleteLog(Long id) {
        activityLogRepository.deleteById(id);
    }

    /*
     * Xóa tất cả logs
     */
    @Transactional
    public void deleteAllLogs() {
        activityLogRepository.deleteAll();
    }

    private ActivityLogDTO convertToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(log.getId());
        dto.setUserId(log.getUser() != null ? log.getUser().getId() : null);
        dto.setUsername(log.getUsername());
        dto.setUserRole(log.getUserRole());
        dto.setAction(log.getAction());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}