package ch.reidyt.hivebalance.user.controller;

import java.util.Collections;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ch.reidyt.hivebalance.user.dto.UserDTO;
import ch.reidyt.hivebalance.user.dto.UserRegistrationDTO;
import ch.reidyt.hivebalance.user.model.BeeUser;
import ch.reidyt.hivebalance.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody UserRegistrationDTO userRegistrationDTO,
            HttpServletRequest request,
            HttpServletResponse response) {
        BeeUser beeUser = userService.createUser(userRegistrationDTO);
        UserDTO userDTO = new UserDTO(beeUser.getId(), beeUser.getEmail(), beeUser.getUsername());

        SecurityContext context = SecurityContextHolder.getContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(userDTO, null, Collections.emptyList()));
        securityContextRepository.saveContext(context, request, response);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/signOut")
    public ResponseEntity<Void> signOut() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}
