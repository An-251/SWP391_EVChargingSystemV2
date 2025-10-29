package swp391.fa25.swp391;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Swp391Application {
    public static void main(String[] args) {

        SpringApplication.run(Swp391Application.class, args);
    }
}