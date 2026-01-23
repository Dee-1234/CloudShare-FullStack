package com.deepika.CloudShare.controller;

import com.deepika.CloudShare.model.FileEntity;
import com.deepika.CloudShare.repository.FileRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3003")
public class FileController {

    private final FileRepository fileRepository;
    // Define where files will live on your machine
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public FileController(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        // 1. Create the 'uploads' folder if it doesn't exist
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) directory.mkdirs();

        // 2. Define the path where file will be saved
        String filePath = UPLOAD_DIR + file.getOriginalFilename();
        File dest = new File(filePath);

        // 3. Save physical file to disk
        file.transferTo(dest);

        // 4. Save metadata to Database using your existing fields
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(file.getOriginalFilename());
        fileEntity.setFileType(file.getContentType());
        fileEntity.setSize(file.getSize());
        fileEntity.setStoragePath(filePath);
        fileEntity.setUploadedAt(LocalDateTime.now());

        fileRepository.save(fileEntity);

        return ResponseEntity.ok("File uploaded and saved to DB!");
    }

    @GetMapping("/all")
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        return ResponseEntity.ok(fileRepository.findAll());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) {
        return fileRepository.findById(id).map(file -> {
            // 1. Delete the physical file from the disk
            File physicalFile = new File(file.getStoragePath());
            if (physicalFile.exists()) physicalFile.delete();

            // 2. Delete from DB
            fileRepository.delete(file);
            return ResponseEntity.ok("File deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("id") Long id) {
        return fileRepository.findById(id).map(fileEntity -> {
            try {
                // Get the absolute path to the uploads folder
                Path filePath = Paths.get(fileEntity.getStoragePath()).toAbsolutePath().normalize();
                Resource resource = new UrlResource(filePath.toUri());

                if(resource.exists()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getFileName() + "\"")
                            .body(resource);
                } else {
                    // If file is missing from the folder, return a clear error
                    return ResponseEntity.status(404).<Resource>body(null);
                }
            } catch (Exception e) {
                return ResponseEntity.internalServerError().<Resource>build();
            }
        }).orElse(ResponseEntity.notFound().<Resource>build());
    }
}