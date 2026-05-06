import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferStrategy;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.util.ArrayList;
import javax.swing.JFrame;

import java.util.Scanner;

public class Game extends JFrame implements Runnable {

    public static int mapWidth = 24;
    public static int mapHeight = 24;

    static int furthestCoordX = 4;
    static int furthestCoordY = 4;

    static int escapeX = 4;
    static int escapeY = 4;

    static int verbosity = 0;
    // 0 - debug
    // 1 - assisted
    // 2 - unassisted
    // 3 - the one eyed man

    static boolean found = false;
    static boolean additiveCollapse = true;
    static double seed;

    public static int[][] mapGenerator(int ensureX, int ensureY) {
        int currX = ensureX;
        int currY = ensureY;

        int[][] mtrt = {
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        };

        boolean badBooty = false;

        for (int i = 1; i < (int) (seed * 200 + 300); i++) {
            if (currY > mapHeight - 1) {
                currY = 4;
            }
            if (currY < 1) {
                currY = 4;
            }
            if (currX > mapWidth - 1) {
                currX = 4;
            }
            if (currX < 1) {
                currX = 4;
            }
            if ((currY - 4) + (currX - 4) > (furthestCoordX - 4) + (furthestCoordY - 4)) {
                // furthest valid point from player spawn
                furthestCoordX = currX;
                furthestCoordY = currY;
            }
            mtrt[currY][currX] = 0;
            double rng = (seed * 45 % 30);
            rng-=(int)rng;
            if (rng < 0.25) {
                currY++;
                mtrt[currY][currX] = 0;
                currY++;
            } else if (rng < 0.5) {
                currY--;
                mtrt[currY][currX] = 0;
                currY--;
            } else if (rng < 0.75) {
                currX++;
                mtrt[currY][currX] = 0;
                currX++;
            } else {
                currX--;
                mtrt[currY][currX] = 0;
                currX--;
            }
            try {
                if (!badBooty) {
                    if (Math.random() < 0.02) {
                        badBooty = true;
                        if (currX < mapWidth / 2) {
                            if (verbosity <= 1) {
                                System.out.println("ACCEPT");
                            }
                            for (int z = currX; z >= 0; z--) {
                                mtrt[currY][z] = 0;
                            }
                        } else if (currX >= mapWidth / 2) {
                            if (verbosity <= 1) {
                                System.out.println("REPENT");
                            }
                            for (int z = currX; z <= mapWidth + 1; z++) {
                                mtrt[currY][z] = 0;
                            }
                        } else if (currY < mapHeight / 2) {
                            if (verbosity <= 1) {
                                System.out.println("LIKEWISE");
                            }
                            for (int z = currY; z >= 0; z--) {
                                mtrt[z][currX] = 0;
                            }
                        } else {
                            if (verbosity <= 1) {
                                System.out.println("PERISH");
                            }
                            for (int z = currY; z <= mapHeight; z++) {
                                mtrt[z][currX] = 0;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                mapGenerator(ensureX, ensureY);
            }
        }

        mtrt[5][5] = 0;
        mtrt[5][4] = 0;
        mtrt[3][4] = 0;
        mtrt[4][3] = 0;
        mtrt[3][3] = 0;

        for (int y = 0; y < mapHeight; y++) {
            for (int x = 0; x < mapWidth; x++) {
                if (Math.random() < 0.15) {
                    mtrt[y][x] = 0;
                }
                if (mtrt[y][x] == 0) {
                    continue;
                }
                if (Math.sqrt(Math.abs(x - furthestCoordX) ^ 2 + Math.abs(y - furthestCoordY) ^ 2) < 2) {
                    mtrt[y][x] = 3;
                } else if (Math.sqrt(Math.abs(x - furthestCoordX) ^ 2 + Math.abs(y - furthestCoordY) ^ 2) < 4) {
                    mtrt[y][x] = 2;
                }
            }
        }
        if (mtrt[furthestCoordY][furthestCoordX + 1] != 0) {
            mtrt[furthestCoordY][furthestCoordX + 1] = 4;
        }
        if (mtrt[furthestCoordY + 1][furthestCoordX + 1] != 0) {
            mtrt[furthestCoordY + 1][furthestCoordX + 1] = 4;
        }
        if (mtrt[furthestCoordY + 1][furthestCoordX] != 0) {
            mtrt[furthestCoordY + 1][furthestCoordX] = 4;
        }
        if (mtrt[furthestCoordY][furthestCoordX - 1] != 0) {
            mtrt[furthestCoordY][furthestCoordX - 1] = 4;
        }
        if (mtrt[furthestCoordY - 1][furthestCoordX - 1] != 0) {
            mtrt[furthestCoordY - 1][furthestCoordX - 1] = 4;
        }
        if (mtrt[furthestCoordY - 1][furthestCoordX] != 0) {
            mtrt[furthestCoordY - 1][furthestCoordX] = 4;
        }
        if (mtrt[furthestCoordY - 1][furthestCoordX + 1] != 0) {
            mtrt[furthestCoordY - 1][furthestCoordX + 1] = 4;
        }
        if (mtrt[furthestCoordY + 1][furthestCoordX - 1] != 0) {
            mtrt[furthestCoordY + 1][furthestCoordX - 1] = 4;
        }

        mtrt[furthestCoordY][furthestCoordX] = 5;

        mtrt[4][5] = 6;

        if (verbosity <= 0) {
            for (int[] col : mtrt) {
                System.out.println();
                for (int row : col) {
                    System.out.print(Integer.toString(row) + ", ");
                }
                System.out.println();
            }
        }

        return mtrt;
    }

    private static final long serialVersionUID = 1L;
    private Thread thread;
    private boolean running;
    private BufferedImage image;
    public int[] pixels;
    public ArrayList<Texture> textures;
    public Camera camera;
    public Screen screen;
    public static int[][] map;

    public Game(double x, double y) {
        thread = new Thread(this);
        image = new BufferedImage(640, 480, BufferedImage.TYPE_INT_RGB);
        pixels = ((DataBufferInt) image.getRaster().getDataBuffer()).getData();
        textures = new ArrayList<Texture>();
        textures.add(Texture.nobooty);
        textures.add(Texture.fewbooty);
        textures.add(Texture.somebooty);
        textures.add(Texture.muchbooty);
        textures.add(Texture.booty);
        textures.add(Texture.exit);
        camera = new Camera(x, y, 1, 0, 0, -.66);
        screen = new Screen(map, mapWidth, mapHeight, textures, 640, 480);
        addKeyListener(camera);
        setSize(640, 480);
        setResizable(false);
        setTitle("Djibouti Caves");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setBackground(Color.black);
        setLocationRelativeTo(null);
        setVisible(true);
        start();
    }

    private synchronized void start() {
        running = true;
        thread.start();
    }

    public synchronized void stop() {
        running = false;
        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public void render() {
        BufferStrategy bs = getBufferStrategy();
        if (bs == null) {
            createBufferStrategy(3);
            return;
        }
        Graphics g = bs.getDrawGraphics();
        g.drawImage(image, 0, 0, image.getWidth(), image.getHeight(), null);
        bs.show();
    }

    public static Game game = null;

    @Override
    public void run() {
        int maxSanity = 60 * 20;
        int sanity = maxSanity;
        int health = 100;
        long lastTime = System.nanoTime();
        final double ns = 1000000000.0 / 60.0;// 60 times per second
        double delta = 0;
        requestFocus();
        int ticker = 0;
        while (running) {
            long now = System.nanoTime();
            delta = delta + ((now - lastTime) / ns);
            lastTime = now;
            while (delta >= 1)// Make sure update is only happening 60 times a second
            {
                // handles all of the logic restricted time
                if (sanity == 0) {
                    if (found) {
                        health -= 7;
                        if (health < 0) {
                            for (int i = 0; i < 100; i++) {
                                System.out.println("WRATH");
                            }
                            System.exit(-66656172);
                        }
                    } else {
                        if (verbosity <= 2) {
                            System.out.println("RECLAMATION");
                        }
                        double[] cpos = camera.update(map);
                        map = mapGenerator((int) cpos[0], (int) cpos[1]);
                        screen = new Screen(map, mapWidth, mapHeight, textures, 640, 480);
                        sanity = maxSanity;
                    }
                }
                try {
                    screen.update(camera, pixels);
                } catch (Exception e) {
                    // glitch visual effect
                    // glitch sound
                    // detract from sanity (start getting map changes)
                    sanity -= 30;
                    if (sanity < 0) {
                        sanity = 0;
                    }
                    delta -= (int) (Math.random() * 5) + 1;
                    if (verbosity <= 2) {
                        System.out.println("SEENOEVIL" + Integer.toString(sanity));
                    }
                }
                try {
                    double[] cpos = camera.update(map);
                    if (!found && Math.sqrt(Math.pow(Math.abs(cpos[1] - furthestCoordX), 2)
                            + Math.pow(Math.abs(cpos[0] - furthestCoordY), 2)) < 2) {
                        if (verbosity <= 2) {
                            System.out.println("SHEPHERD");
                        }
                        map[furthestCoordY][furthestCoordX] = 0;
                        found = true;
                    } else if (found && Math.sqrt(Math.pow(Math.abs(cpos[1] - escapeX), 2)
                            + Math.pow(Math.abs(cpos[0] - escapeY), 2)) < 2) {
                        System.out.println("ESCAPE");
                        System.exit(0);
                    }
                } catch (Exception e) {
                    // detract from health and set sanity to 0
                    sanity = 0;
                    health--;
                    if (health < 0) {
                        for (int i = 0; i < 100; i++) {
                            System.out.println("WRATH");
                        }
                        System.exit(-66656172);
                    }
                }
                if (found) {
                    if (ticker >= 30) {
                        ticker = 0;
                        double[] cpos = camera.update(map);
                        int ytr = (int) (Math.random() * mapHeight);
                        int xtr = (int) (Math.random() * mapWidth);
                        while (ytr == cpos[1]) {
                            ytr = (int) (Math.random() * mapHeight);
                        }
                        while (xtr == cpos[0]) {
                            xtr = (int) (Math.random() * mapWidth);
                        }
                        map[ytr][xtr] = 0;
                        if (additiveCollapse) {
                            map[ytr][xtr] = 1;
                        }
                        if (verbosity <= 1) {
                            System.out.println("COLLAPSE: " + xtr + ", " + ytr);
                        }
                        screen = new Screen(map, mapWidth, mapHeight, textures, 640, 480);
                    } else {
                        ticker++;
                    }
                    delta += .2;
                }
                delta--;
            }
            render();// displays to the screen unrestricted time
        }
    }

    public static void main(String[] args) {
        Scanner uI = new Scanner(System.in);
        System.out.println("DJIBOUTI CAVES");
        System.out.print("0 : DEBUG | 1 : ASSISTED | 2 : UNASSISTED | 3 : IN THE LAND OF THE BLIND\nINFORMATION VERBOSITY\n > ");
        verbosity = uI.nextInt();
        if (verbosity >= 3) System.out.println("\nTHE ONE EYED MAN IS KING\n");
        System.out.print("TRUE : ADDITIVE | FALSE : SUBTRACTIVE\nCOLLAPSE TYPE\n > ");
        additiveCollapse = uI.nextBoolean();
        System.out.print("ENTER SEED OR ANY LETTER FOR RANDOM SEED\n > ");
        try {seed=Double.parseDouble("0."+uI.next());} catch(Exception e) {seed=Math.random();}
        
        System.out.println("\n\n\n\n\nAND SO IT BEGINS");
        map = mapGenerator(4, 4);
        game = new Game(4.5, 4.5);
    }
}