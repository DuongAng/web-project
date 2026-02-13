package com.library.config;

import com.library.entity.Category;
import com.library.entity.Library;
import com.library.entity.Role;
import com.library.enums.CategoryType;
import com.library.repository.CategoryRepository;
import com.library.repository.LibraryRepository;
import com.library.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/*
Tạo data gốc tạo 3 roles cho các tài khoản. hmm nếu mà dùng enum chắc ngon hơn á mà lỡ dùng bình thường
rồi cũng chả sao =))
*/

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final LibraryRepository libraryRepository;


    // chạy khi spring boot start xong :))
    @Override
    public void run(String... args) {
        initRoles();
        initCategoriesFromEnum();
        initDefaultLibrary();
        log.info("Data initialization completed!");
    }

    // Tạo 3 roles và tất nhiên description rồi.
    private void initRoles() {
        if (roleRepository.count() == 0) {
            String[][] roles = {
                    {"USER", "Regular users"},
                    {"STAFF", "Library staff"},
                    {"ADMIN", "System administrator"}
            };
            for (String[] roleData : roles) {
                Role role = new Role();
                role.setName(roleData[0]);
                role.setDescription(roleData[1]);
                roleRepository.save(role);
            }
            log.info("Roles initialized: USER, STAFF, ADMIN");
        }
    }

    // yep chính nó ném 1 đống thể loại enum vào. và tất nhiên tôi nên dùng cái này ở chỗ roles.
    private void initCategoriesFromEnum() {
        if (categoryRepository.count() == 0) {
            for (CategoryType type : CategoryType.values()) {
                Category category = new Category();
                category.setName(type.getDisplayName());
                category.setDescription(type.getDescription());
                categoryRepository.save(category);
            }
            log.info("Categories initialized from CategoryType enum ({} categories)", CategoryType.values().length);
        }
    }

    // Tạo 1 thư viện gốc. well thì nó là dự định mở rộng thêm chi nhánh để quản lý nhưng mà phức tạp quá nên thôi -)) hehe
    private void initDefaultLibrary() {
        if (libraryRepository.count() == 0) {
            Library library = new Library();
            library.setName("Central Library");
            library.setAddress("123 ABC Street, District 1, Ho Chi Minh City");
            libraryRepository.save(library);
            log.info("Default library initialized: Central Library");
        }
    }
}