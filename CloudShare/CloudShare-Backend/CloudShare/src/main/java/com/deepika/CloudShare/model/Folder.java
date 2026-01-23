package com.deepika.CloudShare.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Folder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Folder parent; // Self-reference for nesting

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Folder> subFolders;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;
}
