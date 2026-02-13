package com.library.service;

import com.library.entity.Publisher;
import com.library.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherService {

    private final PublisherRepository publisherRepository;

    public List<Publisher> getAllPublishers() {
        return publisherRepository.findAll();
    }

    public Publisher getPublisherById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));
    }

    @Transactional
    public Publisher createPublisher(Publisher publisher) {
        if (publisherRepository.findByName(publisher.getName()).isPresent()) {
            throw new RuntimeException("Publisher with this name already exists");
        }
        return publisherRepository.save(publisher);
    }

    @Transactional
    public Publisher updatePublisher(Long id, Publisher publisherDetails) {
        Publisher publisher = getPublisherById(id);
        publisher.setName(publisherDetails.getName());
        publisher.setAddress(publisherDetails.getAddress());
        return publisherRepository.save(publisher);
    }

    @Transactional
    public void deletePublisher(Long id) {
        if (!publisherRepository.existsById(id)) {
            throw new RuntimeException("Publisher not found");
        }
        publisherRepository.deleteById(id);
    }
}