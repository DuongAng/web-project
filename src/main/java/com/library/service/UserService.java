package com.library.service;

import com.library.dto.response.UserDTO;
import com.library.entity.ActivityLog;
import com.library.entity.BorrowRecord;
import com.library.entity.Fine;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.FineRepository;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogRepository activityLogRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;

    private void logActivity(User user, String action) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setUsername(user.getUsername());
        log.setUserRole(user.getRole().getName());
        log.setAction(action);
        activityLogRepository.save(log);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }
        if (userDTO.getStudentCode() != null) {
            user.setStudentCode(userDTO.getStudentCode());
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Transactional
    public UserDTO updateUserRole(Long userId, String roleName, User admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldRole = user.getRole().getName();

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRole(role);
        User savedUser = userRepository.save(user);

        // Log activity
        logActivity(admin, "Switch roles '" + user.getUsername() + "' from " + oldRole + " to " + roleName);

        return convertToDTO(savedUser);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, User admin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String deletedUsername = user.getUsername();

        // Kiểm tra nếu user đang có sách chưa trả
        List<BorrowRecord> activeBorrows = borrowRecordRepository.findByUserId(id).stream()
                .filter(br -> "BORROWING".equals(br.getStatus()) || "PENDING".equals(br.getStatus()))
                .collect(Collectors.toList());
        if (!activeBorrows.isEmpty()) {
            throw new RuntimeException("This user cannot be removed " + activeBorrows.size() + " books are either undelivered or awaiting approval.");
        }

        // Kiểm tra nếu user có phạt chưa thanh toán
        List<Fine> pendingFines = fineRepository.findByUserIdAndStatus(id, "PENDING");
        if (!pendingFines.isEmpty()) {
            throw new RuntimeException("This user cannot be removed " + pendingFines.size() + " due to an unpaid fine.");
        }

        // Set user_id = null trong activity_logs để giữ lại log
        List<ActivityLog> userLogs = activityLogRepository.findByUserId(id);
        for (ActivityLog log : userLogs) {
            log.setUser(null);
        }
        activityLogRepository.saveAll(userLogs);

        // Set user = null trong borrow_records (đã trả) để giữ lịch sử
        List<BorrowRecord> userBorrows = borrowRecordRepository.findByUserId(id);
        for (BorrowRecord br : userBorrows) {
            br.setUser(null);
        }
        borrowRecordRepository.saveAll(userBorrows);

        userRepository.deleteById(id);

        // Log
        logActivity(admin, "Delete user: " + deletedUsername);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().getName());
        dto.setStudentCode(user.getStudentCode());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}