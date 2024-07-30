import pygame
import random

# Initialize Pygame
pygame.init()

# Constants
canvas_width = 1000
canvas_height = 800
ball_radius = 10
image_width = 600
image_height = 600
image_path = 'deadpool.png'

# Setup display
screen = pygame.display.set_mode((canvas_width, canvas_height))
pygame.display.set_caption("Ball and Image Masking")

# Load image
img_deadpool = pygame.image.load(image_path)
img_deadpool = pygame.transform.scale(img_deadpool, (image_width, image_height))

# Create a mask surface
mask_layer = pygame.Surface((canvas_width, canvas_height), pygame.SRCALPHA)

# Ball class
class Ball:
    def __init__(self, x, y, radius):
        self.pos = pygame.Vector2(x, y)
        self.vel = pygame.Vector2(random.uniform(-2, 2), random.uniform(-2, 2))
        self.radius = radius

    def update(self):
        self.pos += self.vel

        # Bounce off the canvas edges
        if self.pos.x < self.radius or self.pos.x > canvas_width - self.radius:
            self.vel.x *= -1
        if self.pos.y < self.radius or self.pos.y > canvas_height - self.radius:
            self.vel.y *= -1

    def draw(self):
        pygame.draw.circle(screen, (255, 255, 255), (int(self.pos.x), int(self.pos.y)), self.radius)

# Initialize ball
ball = Ball(canvas_width / 2, canvas_height / 2, ball_radius)

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Update ball
    ball.update()

    # Clear screen
    screen.fill((50, 50, 50))

    # Clear the mask layer
    mask_layer.fill((0, 0, 0, 0))

    # Draw the ball's trail on the mask layer
    pygame.draw.circle(mask_layer, (255, 255, 255, 255), (int(ball.pos.x), int(ball.pos.y)), ball_radius * 2)

    # Apply the mask by creating an image with the masked area
    masked_img = img_deadpool.copy()
    masked_img.blit(mask_layer, (0, 0), special_flags=pygame.BLEND_RGBA_SUB)

    # Draw the masked image
    screen.blit(masked_img, (canvas_width / 2 - image_width / 2, canvas_height / 2 - image_height / 2))

    # Draw the ball
    ball.draw()

    # Update display
    pygame.display.flip()
    pygame.time.delay(10)

pygame.quit()
