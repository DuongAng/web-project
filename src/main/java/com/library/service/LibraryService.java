package com.library.service;

import com.library.entity.Library;
import com.library.repository.LibraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryRepository libraryRepository;

    public List<Library> getAllLibraries() {
        return libraryRepository.findAll();
    }

    public Library getLibraryById(Long id) {
        return libraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Library not found"));
    }

    @Transactional
    public Library createLibrary(Library library) {
        if (libraryRepository.findByName(library.getName()).isPresent()) {
            throw new RuntimeException("Library with this name already exists");
        }
        return libraryRepository.save(library);
    }

    @Transactional
    public Library updateLibrary(Long id, Library libraryDetails) {
        Library library = getLibraryById(id);
        library.setName(libraryDetails.getName());
        library.setAddress(libraryDetails.getAddress());
        return libraryRepository.save(library);
    }

    @Transactional
    public void deleteLibrary(Long id) {
        if (!libraryRepository.existsById(id)) {
            throw new RuntimeException("Library not found");
        }
        libraryRepository.deleteById(id);
    }
}